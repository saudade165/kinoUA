-- KinoUA admin panel: roles, content flags, recommendations, settings, views, audit. RLS everywhere.
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_admin_core").

create table public.admin_users (
  email      text primary key check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role       text not null check (role in ('owner','admin')),
  added_by   text,
  added_at   timestamptz not null default now()
);
-- only one owner can ever exist
create unique index admin_users_single_owner on public.admin_users ((role)) where role = 'owner';

insert into public.admin_users (email, role, added_by) values
  ('maxfrank376@gmail.com','owner','migration'),
  ('dsergeev129@gmail.com','admin','migration');

-- Role of the current caller, based on the confirmed email stored in auth.users (not on client-supplied data)
create or replace function public.admin_role()
returns text language sql stable security definer set search_path = '' as $$
  select a.role
  from public.admin_users a
  join auth.users u on lower(u.email) = a.email
  where u.id = auth.uid() and u.email_confirmed_at is not null
  limit 1
$$;
revoke all on function public.admin_role() from public, anon;
grant execute on function public.admin_role() to authenticated;

create table public.title_flags (
  title_id   text primary key check (title_id ~ '^[a-z0-9-]{1,100}$'),
  hidden     boolean not null default false,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table public.recommendations (
  id         bigint generated always as identity primary key,
  title_id   text not null unique check (title_id ~ '^[a-z0-9-]{1,100}$'),
  position   int not null default 0,
  note       text check (char_length(note) <= 300),
  created_by text,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key        text primary key check (key in ('announcement','announcement_enabled','support_telegram_url','site_description')),
  value      jsonb not null,
  updated_by text,
  updated_at timestamptz not null default now()
);

create table public.title_views (
  id        bigint generated always as identity primary key,
  title_id  text not null check (title_id ~ '^[a-z0-9-]{1,100}$'),
  user_id   uuid default auth.uid(),
  viewed_at timestamptz not null default now()
);
create index title_views_viewed_at on public.title_views (viewed_at);
create index title_views_title on public.title_views (title_id);

create table public.admin_audit (
  id          bigint generated always as identity primary key,
  actor_email text,
  action      text not null,
  target      text,
  details     jsonb,
  at          timestamptz not null default now()
);

alter table public.admin_users     enable row level security;
alter table public.title_flags     enable row level security;
alter table public.recommendations enable row level security;
alter table public.site_settings   enable row level security;
alter table public.title_views     enable row level security;
alter table public.admin_audit     enable row level security;

-- admin_users: any admin can read; only the owner can add/remove regular admins; owner row is untouchable via API; no updates at all
create policy "admins read admins" on public.admin_users for select to authenticated using ((select public.admin_role()) is not null);
create policy "owner adds admins" on public.admin_users for insert to authenticated with check ((select public.admin_role()) = 'owner' and role = 'admin');
create policy "owner removes admins" on public.admin_users for delete to authenticated using ((select public.admin_role()) = 'owner' and role = 'admin');

-- content tables: admins (owner or admin) manage
create policy "admins read flags" on public.title_flags for select to authenticated using ((select public.admin_role()) is not null);
create policy "admins insert flags" on public.title_flags for insert to authenticated with check ((select public.admin_role()) is not null);
create policy "admins update flags" on public.title_flags for update to authenticated using ((select public.admin_role()) is not null) with check ((select public.admin_role()) is not null);
create policy "admins delete flags" on public.title_flags for delete to authenticated using ((select public.admin_role()) is not null);

create policy "admins read recs" on public.recommendations for select to authenticated using ((select public.admin_role()) is not null);
create policy "admins insert recs" on public.recommendations for insert to authenticated with check ((select public.admin_role()) is not null);
create policy "admins update recs" on public.recommendations for update to authenticated using ((select public.admin_role()) is not null) with check ((select public.admin_role()) is not null);
create policy "admins delete recs" on public.recommendations for delete to authenticated using ((select public.admin_role()) is not null);

create policy "admins read settings" on public.site_settings for select to authenticated using ((select public.admin_role()) is not null);
create policy "admins insert settings" on public.site_settings for insert to authenticated with check ((select public.admin_role()) is not null);
create policy "admins update settings" on public.site_settings for update to authenticated using ((select public.admin_role()) is not null) with check ((select public.admin_role()) is not null);

-- views: anyone may record a view (only for themselves), only admins read
create policy "anyone records a view" on public.title_views for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));
create policy "admins read views" on public.title_views for select to authenticated using ((select public.admin_role()) is not null);

create policy "admins read audit" on public.admin_audit for select to authenticated using ((select public.admin_role()) is not null);

grant select, insert, delete on public.admin_users to authenticated;
grant select, insert, update, delete on public.title_flags, public.recommendations to authenticated;
grant select, insert, update on public.site_settings to authenticated;
grant insert on public.title_views to anon, authenticated;
grant select on public.title_views, public.admin_audit to authenticated;

-- audit trail (server-side trigger; actor = confirmed email of the caller)
create or replace function public.audit_admin_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare actor text; tgt text; rec jsonb;
begin
  select u.email into actor from auth.users u where u.id = auth.uid();
  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  tgt := coalesce(rec->>'email', rec->>'title_id', rec->>'key');
  insert into public.admin_audit (actor_email, action, target, details)
  values (actor, tg_table_name || '.' || lower(tg_op), tgt, rec);
  return null;
end $$;
revoke all on function public.audit_admin_change() from public, anon, authenticated;
create trigger audit_admin_users after insert or delete on public.admin_users for each row execute function public.audit_admin_change();
create trigger audit_title_flags after insert or update or delete on public.title_flags for each row execute function public.audit_admin_change();
create trigger audit_recommendations after insert or update or delete on public.recommendations for each row execute function public.audit_admin_change();
create trigger audit_site_settings after insert or update on public.site_settings for each row execute function public.audit_admin_change();

-- stamp who changed content (server-side, cannot be spoofed by the client)
create or replace function public.stamp_actor()
returns trigger language plpgsql security definer set search_path = '' as $$
declare actor text;
begin
  select u.email into actor from auth.users u where u.id = auth.uid();
  if tg_table_name = 'title_flags' then new.updated_by := actor; new.updated_at := now();
  elsif tg_table_name = 'site_settings' then new.updated_by := actor; new.updated_at := now();
  elsif tg_table_name = 'recommendations' and tg_op = 'INSERT' then new.created_by := actor;
  elsif tg_table_name = 'admin_users' then new.added_by := actor; new.added_at := now();
  end if;
  return new;
end $$;
revoke all on function public.stamp_actor() from public, anon, authenticated;
create trigger stamp_title_flags before insert or update on public.title_flags for each row execute function public.stamp_actor();
create trigger stamp_site_settings before insert or update on public.site_settings for each row execute function public.stamp_actor();
create trigger stamp_recommendations before insert on public.recommendations for each row execute function public.stamp_actor();
create trigger stamp_admin_users before insert on public.admin_users for each row execute function public.stamp_actor();
