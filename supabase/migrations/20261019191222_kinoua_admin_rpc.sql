-- KinoUA admin panel: server functions. Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_admin_rpc").
-- Admin functions check public.admin_role() inside and are not executable by anon.

-- Public, read-only state for the static site: hidden titles, editor's picks, public settings. No personal data.
create or replace function public.public_site_state()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'hidden', coalesce((select jsonb_agg(f.title_id order by f.title_id) from public.title_flags f where f.hidden), '[]'::jsonb),
    'recs', coalesce((select jsonb_agg(jsonb_build_object('id', r.title_id, 'note', r.note) order by r.position, r.id) from public.recommendations r), '[]'::jsonb),
    'settings', coalesce((select jsonb_object_agg(s.key, s.value) from public.site_settings s), '{}'::jsonb)
  )
$$;
revoke all on function public.public_site_state() from public;
grant execute on function public.public_site_state() to anon, authenticated;

create or replace function public.admin_whoami()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('email', u.email, 'role', public.admin_role())
  from auth.users u where u.id = auth.uid()
$$;
revoke all on function public.admin_whoami() from public, anon;
grant execute on function public.admin_whoami() to authenticated;

create or replace function public.admin_list_users(p_search text default '', p_provider text default '', p_role text default '', p_limit int default 10, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare res jsonb;
begin
  if public.admin_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  with base as (
    select u.id, u.email, u.created_at, u.last_sign_in_at,
           coalesce(u.raw_app_meta_data->>'provider', 'email') as provider,
           u.raw_user_meta_data->>'full_name' as name,
           u.raw_user_meta_data->>'avatar_url' as avatar,
           a.role
    from auth.users u left join public.admin_users a on a.email = lower(u.email)
    where (coalesce(p_search,'') = '' or u.email ilike '%' || p_search || '%' or u.id::text = p_search or coalesce(u.raw_user_meta_data->>'full_name','') ilike '%' || p_search || '%')
      and (coalesce(p_provider,'') = '' or coalesce(u.raw_app_meta_data->>'provider','email') = p_provider)
      and (coalesce(p_role,'') = '' or (p_role = 'user' and a.role is null) or a.role = p_role)
  )
  select jsonb_build_object(
    'total', (select count(*) from base),
    'rows', coalesce((select jsonb_agg(to_jsonb(b) order by b.created_at desc) from (select * from base order by created_at desc limit least(greatest(p_limit,1),100) offset greatest(p_offset,0)) b), '[]'::jsonb),
    'providers', coalesce((select jsonb_agg(distinct coalesce(u.raw_app_meta_data->>'provider','email')) from auth.users u), '[]'::jsonb)
  ) into res;
  return res;
end $$;
revoke all on function public.admin_list_users(text,text,text,int,int) from public, anon;
grant execute on function public.admin_list_users(text,text,text,int,int) to authenticated;

create or replace function public.admin_stats(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare d int := least(greatest(coalesce(p_days,30),1),365); res jsonb;
begin
  if public.admin_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  select jsonb_build_object(
    'days', d,
    'users_total', (select count(*) from auth.users),
    'users_new_7d', (select count(*) from auth.users where created_at >= now() - interval '7 days'),
    'users_active_period', (select count(*) from auth.users where last_sign_in_at >= now() - make_interval(days => d)),
    'views_total', (select count(*) from public.title_views),
    'views_period', (select count(*) from public.title_views where viewed_at >= now() - make_interval(days => d)),
    'views_prev_period', (select count(*) from public.title_views where viewed_at >= now() - make_interval(days => 2*d) and viewed_at < now() - make_interval(days => d)),
    'views_since', (select min(viewed_at) from public.title_views),
    'series', (select jsonb_agg(jsonb_build_object('day', g.dy, 'new_users', coalesce(nu.c,0), 'signins', coalesce(si.c,0), 'views', coalesce(v.c,0)) order by g.dy)
               from (select gs::date as dy from generate_series((now() - make_interval(days => d-1))::date, now()::date, interval '1 day') as gs) g
               left join (select created_at::date as dy, count(*) as c from auth.users group by 1) nu on nu.dy = g.dy
               left join (select last_sign_in_at::date as dy, count(*) as c from auth.users where last_sign_in_at is not null group by 1) si on si.dy = g.dy
               left join (select viewed_at::date as dy, count(*) as c from public.title_views group by 1) v on v.dy = g.dy),
    'recent_users', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select u.email, u.created_at, u.raw_user_meta_data->>'avatar_url' as avatar from auth.users u order by u.created_at desc limit 5) x),
    'top_titles', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select tv.title_id, count(*) as views from public.title_views tv where tv.viewed_at >= now() - make_interval(days => d) group by tv.title_id order by 2 desc limit 10) x),
    'providers', (select coalesce(jsonb_object_agg(x.p, x.c), '{}'::jsonb) from (select coalesce(raw_app_meta_data->>'provider','email') as p, count(*) as c from auth.users group by 1) x),
    'last_audit', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select a.actor_email, a.action, a.target, a.at from public.admin_audit a order by a.at desc limit 8) x)
  ) into res;
  return res;
end $$;
revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;
