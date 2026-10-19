-- KinoUA CMS: single source of truth for the catalog (site + admin). Public reads go through definer RPCs that return published rows only.
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_cms_schema"). Requires 20261019191138_kinoua_admin_core.sql (admin_role(), admin_audit).

create table public.genres (
  slug     text primary key check (slug ~ '^[a-z0-9-]{2,40}$'),
  icon     text,
  name_uk  text not null check (char_length(name_uk) between 1 and 60),
  name_ru  text,
  name_en  text,
  sections text[] not null default '{}',        -- в меню яких розділів показувати: films/series/cartoons
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.content (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
  ty            text not null check (ty in ('films','cartoons','series')),
  title_orig    text not null check (char_length(title_orig) between 1 and 200),
  title_uk      text check (char_length(title_uk) <= 200),
  title_ru      text check (char_length(title_ru) <= 200),
  alt_titles    text[] not null default '{}',
  short         jsonb not null default '{}'::jsonb,   -- {uk,ru,en}
  description   jsonb not null default '{}'::jsonb,   -- {uk,ru,en}
  tagline       jsonb not null default '{}'::jsonb,
  year          int check (year between 1880 and 2100),
  premiere_date date,
  date_region   text,
  countries     text[] not null default '{}',
  cert          text check (char_length(cert) <= 20),
  cert_region   text check (char_length(cert_region) <= 10),
  runtime_min   int check (runtime_min between 1 and 1000),
  release_status text not null default 'released' check (release_status in ('planned','in-production','post-production','upcoming','released','returning','ended','paused')),
  orig_lang     text check (orig_lang ~ '^[a-z]{2,3}$'),
  audio_langs   text[] not null default '{}',
  subs_langs    text[],                                -- null = невідомо
  rating_imdb   numeric(3,1) check (rating_imdb between 0 and 10),
  rating_imdb_votes int check (rating_imdb_votes >= 0),
  rating_tmdb   numeric(3,1) check (rating_tmdb between 0 and 10),
  imdb_id       text check (imdb_id ~ '^tt\d{7,9}$'),
  tmdb_id       int,
  pop_rank      int,                                   -- позиція в TMDB Popular (знімок), не жива популярність
  editorial_rank int,
  trailer_yt    text check (trailer_yt ~ '^[\w-]{11}$'),
  trailer_name  text,
  poster        text,
  backdrop      text,
  banner        text,
  tags          text[] not null default '{}',
  lvl           jsonb,
  cast_list     jsonb not null default '[]'::jsonb,
  crew          jsonb not null default '[]'::jsonb,
  with_cast     jsonb not null default '[]'::jsonb,
  pub_status    text not null default 'draft' check (pub_status in ('draft','review','scheduled','published','hidden','archived')),
  publish_at    timestamptz,
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  created_by    text,
  updated_by    text,
  check (pub_status <> 'scheduled' or publish_at is not null)
);
create index content_public_idx on public.content (pub_status, publish_at) where deleted_at is null;
create index content_ty_idx on public.content (ty);
create index content_title_idx on public.content (lower(title_orig));

create table public.content_genres (
  content_id uuid not null references public.content(id) on delete cascade,
  genre_slug text not null references public.genres(slug) on update cascade on delete cascade,
  position   int not null default 0,
  primary key (content_id, genre_slug)
);
create index content_genres_genre_idx on public.content_genres (genre_slug);

create table public.seasons (
  id          uuid primary key default gen_random_uuid(),
  content_id  uuid not null references public.content(id) on delete cascade,
  number      int not null check (number between 0 and 500),
  title       text,
  description jsonb not null default '{}'::jsonb,
  year        int,
  position    int not null default 0,
  unique (content_id, number)
);

create table public.episodes (
  id          uuid primary key default gen_random_uuid(),
  season_id   uuid not null references public.seasons(id) on delete cascade,
  number      int not null check (number between 0 and 5000),
  title       text,
  description jsonb not null default '{}'::jsonb,
  air_date    date,
  runtime_min int check (runtime_min between 1 and 1000),
  still       text,
  status      text not null default 'published' check (status in ('upcoming','published','hidden')),
  position    int not null default 0,
  unique (season_id, number)
);
create index episodes_season_idx on public.episodes (season_id);

create table public.video_sources (
  id          uuid primary key default gen_random_uuid(),
  content_id  uuid references public.content(id) on delete cascade,
  episode_id  uuid references public.episodes(id) on delete cascade,
  provider    text not null check (provider in ('youtube','vimeo','mp4')),
  ref         text not null check (char_length(ref) between 3 and 1000),
  label       text check (char_length(label) <= 80),
  lang        text check (lang ~ '^[a-z]{2,3}$'),
  is_default  boolean not null default false,
  enabled     boolean not null default true,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  check ((content_id is null) <> (episode_id is null)),
  check (provider <> 'youtube' or ref ~ '^[\w-]{11}$'),
  check (provider <> 'vimeo' or ref ~ '^\d{4,12}$'),
  check (provider <> 'mp4' or ref ~ '^https://[^\s]+$')
);
create index video_sources_content_idx on public.video_sources (content_id);
create index video_sources_episode_idx on public.video_sources (episode_id);

create table public.content_images (
  id         uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  role       text not null check (role in ('slider','still','gallery')),
  path       text not null,
  caption    text,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index content_images_content_idx on public.content_images (content_id);

create table public.categories (
  slug      text primary key check (slug ~ '^[a-z0-9-]{2,40}$'),
  title     jsonb not null default '{}'::jsonb,        -- {uk,ru,en}
  kind      text not null check (kind in ('hero','builtin','manual','auto_new','auto_upcoming')),
  enabled   boolean not null default true,
  position  int not null default 0,
  max_items int not null default 20 check (max_items between 1 and 100),
  starts_at timestamptz,
  ends_at   timestamptz,
  system    boolean not null default false,            -- системні блоки не можна видалити
  created_at timestamptz not null default now()
);
create table public.category_items (
  category_slug text not null references public.categories(slug) on update cascade on delete cascade,
  content_id    uuid not null references public.content(id) on delete cascade,
  position      int not null default 0,
  note          text check (char_length(note) <= 300),
  primary key (category_slug, content_id)
);

-- RLS: усе редагування — лише адміністратори; читати напряму можуть лише адміністратори (сайт читає через RPC з опублікованими полями)
do $$ declare t text; begin
  foreach t in array array['genres','content','content_genres','seasons','episodes','video_sources','content_images','categories','category_items'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admins read %1$s" on public.%1$I for select to authenticated using ((select public.admin_role()) is not null)', t);
    execute format('create policy "admins insert %1$s" on public.%1$I for insert to authenticated with check ((select public.admin_role()) is not null)', t);
    execute format('create policy "admins update %1$s" on public.%1$I for update to authenticated using ((select public.admin_role()) is not null) with check ((select public.admin_role()) is not null)', t);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using ((select public.admin_role()) is not null)', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop; end $$;
-- системні блоки головної не видаляються
drop policy "admins delete categories" on public.categories;
create policy "admins delete categories" on public.categories for delete to authenticated using ((select public.admin_role()) is not null and not system);

-- хто і коли змінив — ставить сервер (клієнт не може підробити)
create or replace function public.stamp_content()
returns trigger language plpgsql security definer set search_path = '' as $$
declare actor text;
begin
  select u.email into actor from auth.users u where u.id = auth.uid();
  new.updated_at := now(); new.updated_by := actor;
  if tg_op = 'INSERT' then new.created_at := now(); new.created_by := actor; end if;
  return new;
end $$;
revoke all on function public.stamp_content() from public, anon, authenticated;
create trigger stamp_content before insert or update on public.content for each row execute function public.stamp_content();

-- журнал змін каталогу
create or replace function public.audit_cms_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare actor text; rec jsonb; tgt text;
begin
  select u.email into actor from auth.users u where u.id = auth.uid();
  rec := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  tgt := coalesce(rec->>'slug', rec->>'category_slug', rec->>'content_id', rec->>'id');
  if tg_table_name = 'content' then rec := rec - 'cast_list' - 'crew' - 'with_cast' - 'description' - 'short' - 'tagline'; end if;
  insert into public.admin_audit (actor_email, action, target, details) values (actor, tg_table_name || '.' || lower(tg_op), tgt, rec);
  return null;
end $$;
revoke all on function public.audit_cms_change() from public, anon, authenticated;
create trigger audit_content after insert or update or delete on public.content for each row execute function public.audit_cms_change();
create trigger audit_genres after insert or update or delete on public.genres for each row execute function public.audit_cms_change();
create trigger audit_categories after insert or update or delete on public.categories for each row execute function public.audit_cms_change();

-- Storage: публічний бакет для зображень; завантажувати/замінювати/видаляти — лише адміністратори; переглядати список файлів анонімам не можна
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media','media', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;
create policy "media: admins upload" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select public.admin_role()) is not null);
create policy "media: admins update" on storage.objects for update to authenticated using (bucket_id = 'media' and (select public.admin_role()) is not null) with check (bucket_id = 'media' and (select public.admin_role()) is not null);
create policy "media: admins delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select public.admin_role()) is not null);
create policy "media: admins list" on storage.objects for select to authenticated using (bucket_id = 'media' and (select public.admin_role()) is not null);
