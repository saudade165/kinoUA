-- KinoUA CMS: server functions. Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_cms_rpc").
-- Public: public_catalog(), public_title(slug), track_view(slug, visitor). Admin-only (checked inside): admin_preview, admin_content_list, admin_duplicate, admin_stats.
-- Authenticated users: record_login() (writes one event per real session found in auth.sessions).
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Видимість для відвідувачів: опубліковано або заплановано й час настав; не в кошику (STABLE — див. 20261019193817)
create or replace function private.visible(c public.content) returns boolean language sql immutable set search_path = '' as $$
  select c.deleted_at is null and (c.pub_status = 'published' or (c.pub_status = 'scheduled' and c.publish_at <= now()))
$$;

-- Компактний запис тайтла (формат, який уже використовує сайт)
create or replace function private.compact(c public.content) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'id', c.slug, 'ty', c.ty, 'kind', case when c.ty = 'series' then 'tv' else 'movie' end, 'tmdb', c.tmdb_id,
    't', c.title_orig, 'n', jsonb_strip_nulls(jsonb_build_object('uk', c.title_uk, 'ru', c.title_ru)), 'alt', to_jsonb(c.alt_titles),
    'y', c.year, 'date', c.premiere_date, 'm', c.runtime_min,
    'g', coalesce((select jsonb_agg(cg.genre_slug order by cg.position) from public.content_genres cg where cg.content_id = c.id), '[]'::jsonb),
    'status', c.release_status,
    'cert', case when c.cert is not null then jsonb_strip_nulls(jsonb_build_object('v', c.cert, 'region', c.cert_region)) end,
    'ratings', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_strip_nulls(jsonb_build_object('src','IMDb','v',c.rating_imdb,'max',10,'votes',c.rating_imdb_votes,'date','2026-10-19')) x where c.rating_imdb is not null
        union all select jsonb_build_object('src','TMDB','v',c.rating_tmdb,'max',10,'date','2026-10-18') where c.rating_tmdb is not null) r),
    'sd', c.short, 'poster', c.poster, 'backdrop', c.backdrop, 'banner', c.banner,
    'trailer', case when c.trailer_yt is not null then jsonb_strip_nulls(jsonb_build_object('yt', c.trailer_yt, 'name', c.trailer_name)) end,
    'pop', c.pop_rank, 'rank', coalesce(c.editorial_rank, 100000),
    'avail', case when exists (select 1 from public.video_sources v where v.enabled and (v.content_id = c.id or v.episode_id in (
               select e.id from public.episodes e join public.seasons s on s.id = e.season_id where s.content_id = c.id and e.status = 'published'))) then 'stream' else 'none' end,
    's', to_jsonb(c.subs_langs), 'ol', c.orig_lang, 'imdb', c.imdb_id, 'lvl', c.lvl,
    'audio', to_jsonb(c.audio_langs), 'countries', to_jsonb(c.countries), 'tags', to_jsonb(c.tags),
    'sc', case when c.ty = 'series' then (select count(*) from public.seasons s where s.content_id = c.id and exists (select 1 from public.episodes e where e.season_id = s.id and e.status <> 'hidden')) end,
    'ec', case when c.ty = 'series' then (select count(*) from public.episodes e join public.seasons s on s.id = e.season_id where s.content_id = c.id and e.status <> 'hidden') end,
    'det', true, 'add', (c.created_at at time zone 'utc')::date
  ))
$$;

-- Повна сторінка тайтла (p_admin=true — для попереднього перегляду: показує й приховані серії)
create or replace function private.detail(c public.content, p_admin boolean) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'd', c.description, 'tagline', c.tagline, 'crew', c.crew, 'cast', c.cast_list, 'olang', c.orig_lang, 'dateRegion', c.date_region,
    'seasons', coalesce((select jsonb_agg(jsonb_build_object('n', s.number, 'year', s.year, 'title', s.title, 'ov', s.description,
        'eps', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('n', e.number, 'name', e.title, 'date', e.air_date, 'rt', e.runtime_min, 'ov', e.description, 'still', e.still, 'status', e.status,
            'src', case when e.status = 'published' or p_admin then (select jsonb_agg(jsonb_build_object('provider', v.provider, 'ref', v.ref, 'label', v.label, 'lang', v.lang, 'def', v.is_default) order by v.is_default desc, v.position)
                       from public.video_sources v where v.episode_id = e.id and v.enabled) end)) order by e.position, e.number)
            from public.episodes e where e.season_id = s.id and (e.status <> 'hidden' or p_admin)), '[]'::jsonb)) order by s.position, s.number)
      from public.seasons s where s.content_id = c.id), '[]'::jsonb),
    'withCast', coalesce((select jsonb_agg(w) from jsonb_array_elements(c.with_cast) w where p_admin or exists (select 1 from public.content o where o.slug = w->>'id' and private.visible(o))), '[]'::jsonb),
    'images', coalesce((select jsonb_agg(jsonb_build_object('role', i.role, 'path', i.path, 'caption', i.caption) order by i.role, i.position) from public.content_images i where i.content_id = c.id), '[]'::jsonb),
    'src', coalesce((select jsonb_agg(jsonb_build_object('provider', v.provider, 'ref', v.ref, 'label', v.label, 'lang', v.lang, 'def', v.is_default) order by v.is_default desc, v.position)
                     from public.video_sources v where v.content_id = c.id and v.enabled), '[]'::jsonb)
  )
$$;
revoke all on all functions in schema private from public, anon, authenticated;

-- Публічний каталог: жанри, опубліковані тайтли, блоки головної, публічні налаштування
create or replace function public.public_catalog()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'v', (select greatest(max(c.updated_at), now() - interval '100 years') from public.content c),
    'genres', coalesce((select jsonb_agg(jsonb_build_object('slug', g.slug, 'icon', g.icon, 'uk', g.name_uk, 'ru', g.name_ru, 'en', g.name_en, 'sections', to_jsonb(g.sections)) order by g.position, g.name_uk) from public.genres g), '[]'::jsonb),
    'titles', coalesce((select jsonb_agg(private.compact(c) order by c.pop_rank nulls last, c.created_at desc) from public.content c where private.visible(c)), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('slug', k.slug, 'kind', k.kind, 'title', k.title, 'max', k.max_items,
        'items', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', c.slug, 'note', i.note)) order by i.position) from public.category_items i join public.content c on c.id = i.content_id where i.category_slug = k.slug and private.visible(c)), '[]'::jsonb)) order by k.position)
      from public.categories k where k.enabled and (k.starts_at is null or k.starts_at <= now()) and (k.ends_at is null or k.ends_at > now())), '[]'::jsonb),
    'settings', coalesce((select jsonb_object_agg(s.key, s.value) from public.site_settings s where s.key in ('announcement','announcement_enabled','support_telegram_url')), '{}'::jsonb)
  )
$$;
revoke all on function public.public_catalog() from public;
grant execute on function public.public_catalog() to anon, authenticated;

create or replace function public.public_title(p_slug text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select private.detail(c, false) from public.content c where c.slug = p_slug and private.visible(c)
$$;
revoke all on function public.public_title(text) from public;
grant execute on function public.public_title(text) to anon, authenticated;

create or replace function public.admin_preview(p_slug text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare c public.content;
begin
  if public.admin_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into c from public.content where slug = p_slug;
  if not found then return null; end if;
  return jsonb_build_object('title', private.compact(c) || jsonb_build_object('pub_status', c.pub_status), 'detail', private.detail(c, true));
end $$;
revoke all on function public.admin_preview(text) from public, anon;
grant execute on function public.admin_preview(text) to authenticated;

-- Публічний стан версії 4.3 (сумісність зі старим кешем сторінок) — тепер з нових таблиць
create or replace function public.public_site_state()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'hidden', coalesce((select jsonb_agg(c.slug) from public.content c where not private.visible(c)), '[]'::jsonb),
    'recs', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id', c.slug, 'note', i.note)) order by i.position) from public.category_items i join public.content c on c.id = i.content_id where i.category_slug = 'editors' and private.visible(c)), '[]'::jsonb),
    'settings', coalesce((select jsonb_object_agg(s.key, s.value) from public.site_settings s where s.key in ('announcement','announcement_enabled','support_telegram_url')), '{}'::jsonb))
$$;

create or replace function public.admin_content_list(p_search text default '', p_ty text default '', p_genre text default '', p_year int default null, p_status text default '', p_trash boolean default false, p_sort text default 'updated', p_limit int default 20, p_offset int default 0)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare res jsonb;
begin
  if public.admin_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  with base as (
    select c.*, (select count(*) from public.title_views v where v.title_id = c.slug) as views,
           coalesce((select array_agg(cg.genre_slug order by cg.position) from public.content_genres cg where cg.content_id = c.id), '{}') as genres
    from public.content c
    where (case when p_trash then c.deleted_at is not null else c.deleted_at is null end)
      and (coalesce(p_search,'') = '' or c.title_orig ilike '%'||p_search||'%' or coalesce(c.title_uk,'') ilike '%'||p_search||'%' or coalesce(c.title_ru,'') ilike '%'||p_search||'%' or c.slug ilike '%'||p_search||'%' or array_to_string(c.alt_titles,' ') ilike '%'||p_search||'%')
      and (coalesce(p_ty,'') = '' or c.ty = p_ty)
      and (coalesce(p_genre,'') = '' or exists (select 1 from public.content_genres cg where cg.content_id = c.id and cg.genre_slug = p_genre))
      and (p_year is null or c.year = p_year)
      and (coalesce(p_status,'') = '' or c.pub_status = p_status)
  )
  select jsonb_build_object('total', (select count(*) from base),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'slug', b.slug, 'ty', b.ty, 'title_orig', b.title_orig, 'title_uk', b.title_uk, 'title_ru', b.title_ru, 'year', b.year, 'poster', b.poster,
        'genres', to_jsonb(b.genres), 'pub_status', b.pub_status, 'publish_at', b.publish_at, 'created_at', b.created_at, 'updated_at', b.updated_at, 'updated_by', b.updated_by, 'deleted_at', b.deleted_at,
        'views', b.views, 'rating_imdb', b.rating_imdb, 'visible', private.visible(b::public.content)))
      from (select * from base order by
              case when p_sort = 'title' then lower(coalesce(base.title_uk, base.title_orig)) end asc,
              case when p_sort = 'views' then base.views end desc nulls last,
              case when p_sort = 'year' then base.year end desc nulls last,
              case when p_sort = 'created' then base.created_at end desc,
              base.updated_at desc
            limit least(greatest(p_limit,1),200) offset greatest(p_offset,0)) b), '[]'::jsonb),
    'counts', (select jsonb_object_agg(s, n) from (select c.pub_status s, count(*) n from public.content c where c.deleted_at is null group by 1) x),
    'trash', (select count(*) from public.content c where c.deleted_at is not null)) into res;
  return res;
end $$;
revoke all on function public.admin_content_list(text,text,text,int,text,boolean,text,int,int) from public, anon;
grant execute on function public.admin_content_list(text,text,text,int,text,boolean,text,int,int) to authenticated;

create or replace function public.admin_duplicate(p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare src public.content; nid uuid; nslug text; n int := 1; s record; nsid uuid; e record; neid uuid;
begin
  if public.admin_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into src from public.content where id = p_id;
  if not found then raise exception 'not found'; end if;
  loop nslug := left(src.slug, 90) || '-copy' || case when n > 1 then '-' || n else '' end; exit when not exists (select 1 from public.content where slug = nslug); n := n + 1; end loop;
  insert into public.content (slug,ty,title_orig,title_uk,title_ru,alt_titles,short,description,tagline,year,premiere_date,date_region,countries,cert,cert_region,runtime_min,release_status,orig_lang,audio_langs,subs_langs,
    rating_imdb,rating_imdb_votes,rating_tmdb,imdb_id,tmdb_id,trailer_yt,trailer_name,poster,backdrop,banner,tags,lvl,cast_list,crew,with_cast,pub_status)
  select nslug,ty,title_orig||' (копія)',case when title_uk is not null then title_uk||' (копія)' end,title_ru,alt_titles,short,description,tagline,year,premiere_date,date_region,countries,cert,cert_region,runtime_min,release_status,orig_lang,audio_langs,subs_langs,
    null,null,null,null,null,trailer_yt,trailer_name,poster,backdrop,banner,tags,lvl,cast_list,crew,with_cast,'draft' from public.content where id = p_id returning id into nid;
  insert into public.content_genres(content_id,genre_slug,position) select nid,genre_slug,position from public.content_genres where content_id = p_id;
  insert into public.video_sources(content_id,provider,ref,label,lang,is_default,enabled,position) select nid,provider,ref,label,lang,is_default,enabled,position from public.video_sources where content_id = p_id;
  for s in select * from public.seasons where content_id = p_id loop
    insert into public.seasons(content_id,number,title,description,year,position) values (nid,s.number,s.title,s.description,s.year,s.position) returning id into nsid;
    for e in select * from public.episodes where season_id = s.id loop
      insert into public.episodes(season_id,number,title,description,air_date,runtime_min,still,status,position) values (nsid,e.number,e.title,e.description,e.air_date,e.runtime_min,e.still,e.status,e.position) returning id into neid;
      insert into public.video_sources(episode_id,provider,ref,label,lang,is_default,enabled,position) select neid,provider,ref,label,lang,is_default,enabled,position from public.video_sources where episode_id = e.id;
    end loop;
  end loop;
  return jsonb_build_object('id', nid, 'slug', nslug);
end $$;
revoke all on function public.admin_duplicate(uuid) from public, anon;
grant execute on function public.admin_duplicate(uuid) to authenticated;

-- ===== Перегляди: лише через функцію, з дедуплікацією та лімітами =====
create table private.secret (k text primary key, v text not null);
insert into private.secret values ('view_salt', encode(extensions.gen_random_bytes(32), 'hex'));

alter table public.title_views add column visitor_id uuid, add column ip_hash text;
create index title_views_dedupe on public.title_views (title_id, visitor_id, viewed_at);
create index title_views_ip on public.title_views (ip_hash, viewed_at);
drop policy "anyone records a view" on public.title_views;
revoke insert on public.title_views from anon, authenticated;

create or replace function public.track_view(p_slug text, p_visitor uuid)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare ip text; h text;
begin
  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{1,99}$' or p_visitor is null then return false; end if;
  if not exists (select 1 from public.content c where c.slug = p_slug and private.visible(c)) then return false; end if;
  ip := split_part(coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''), ',', 1);
  -- IP не зберігається: лише хеш з секретною сіллю (для лімітів)
  h := encode(extensions.digest(ip || (select v from private.secret where k = 'view_salt'), 'sha256'), 'hex');
  -- той самий відвідувач і тайтл — не частіше разу на 30 хв
  if exists (select 1 from public.title_views v where v.title_id = p_slug and v.visitor_id = p_visitor and v.viewed_at > now() - interval '30 minutes') then return false; end if;
  -- з однієї IP той самий тайтл — не частіше 20 разів на годину; усього — не більше 200 на годину
  if (select count(*) from public.title_views v where v.ip_hash = h and v.title_id = p_slug and v.viewed_at > now() - interval '1 hour') >= 20 then return false; end if;
  if (select count(*) from public.title_views v where v.ip_hash = h and v.viewed_at > now() - interval '1 hour') >= 200 then return false; end if;
  insert into public.title_views(title_id, user_id, visitor_id, ip_hash) values (p_slug, auth.uid(), p_visitor, h);
  return true;
end $$;
revoke all on function public.track_view(text, uuid) from public;
grant execute on function public.track_view(text, uuid) to anon, authenticated;

-- ===== Входи: один запис на справжню сесію Supabase =====
create table public.login_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null unique,
  provider   text,
  at         timestamptz not null
);
alter table public.login_events enable row level security;
create policy "admins read logins" on public.login_events for select to authenticated using ((select public.admin_role()) is not null);
grant select on public.login_events to authenticated;
revoke all on public.login_events from anon;

create or replace function public.record_login()
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare sid uuid; s record;
begin
  begin sid := (auth.jwt()->>'session_id')::uuid; exception when others then return false; end;
  if sid is null or auth.uid() is null then return false; end if;
  select x.id, x.created_at into s from auth.sessions x where x.id = sid and x.user_id = auth.uid();
  if not found then return false; end if;
  insert into public.login_events(user_id, session_id, provider, at)
  values (auth.uid(), sid, (select u.raw_app_meta_data->>'provider' from auth.users u where u.id = auth.uid()), s.created_at)
  on conflict (session_id) do nothing;
  return true;
end $$;
revoke all on function public.record_login() from public, anon;
grant execute on function public.record_login() to authenticated;

insert into public.login_events(user_id, session_id, provider, at)
select s.user_id, s.id, u.raw_app_meta_data->>'provider', s.created_at from auth.sessions s join auth.users u on u.id = s.user_id
on conflict (session_id) do nothing;

-- Статистика: входи — з login_events (кожна сесія), а не з last_sign_in_at
create or replace function public.admin_stats(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare d int := least(greatest(coalesce(p_days,30),1),365); res jsonb;
begin
  if public.admin_role() is null then raise exception 'forbidden' using errcode = '42501'; end if;
  select jsonb_build_object(
    'days', d,
    'users_total', (select count(*) from auth.users),
    'users_new_7d', (select count(*) from auth.users where created_at >= now() - interval '7 days'),
    'users_active_period', (select count(distinct user_id) from public.login_events where at >= now() - make_interval(days => d)),
    'logins_period', (select count(*) from public.login_events where at >= now() - make_interval(days => d)),
    'logins_since', (select min(at) from public.login_events),
    'views_total', (select count(*) from public.title_views),
    'views_period', (select count(*) from public.title_views where viewed_at >= now() - make_interval(days => d)),
    'views_prev_period', (select count(*) from public.title_views where viewed_at >= now() - make_interval(days => 2*d) and viewed_at < now() - make_interval(days => d)),
    'visitors_period', (select count(distinct coalesce(visitor_id::text, ip_hash, id::text)) from public.title_views where viewed_at >= now() - make_interval(days => d)),
    'views_since', (select min(viewed_at) from public.title_views),
    'series', (select jsonb_agg(jsonb_build_object('day', g.dy, 'new_users', coalesce(nu.c,0), 'signins', coalesce(si.c,0), 'views', coalesce(v.c,0)) order by g.dy)
               from (select gs::date as dy from generate_series((now() - make_interval(days => d-1))::date, now()::date, interval '1 day') as gs) g
               left join (select created_at::date as dy, count(*) as c from auth.users group by 1) nu on nu.dy = g.dy
               left join (select at::date as dy, count(*) as c from public.login_events group by 1) si on si.dy = g.dy
               left join (select viewed_at::date as dy, count(*) as c from public.title_views group by 1) v on v.dy = g.dy),
    'recent_users', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select u.email, u.created_at, u.raw_user_meta_data->>'avatar_url' as avatar from auth.users u order by u.created_at desc limit 5) x),
    'top_titles', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select tv.title_id, coalesce(c.title_uk, c.title_orig, tv.title_id) as title, count(*) as views from public.title_views tv left join public.content c on c.slug = tv.title_id where tv.viewed_at >= now() - make_interval(days => d) group by tv.title_id, c.title_uk, c.title_orig order by 3 desc limit 10) x),
    'providers', (select coalesce(jsonb_object_agg(x.p, x.c), '{}'::jsonb) from (select coalesce(raw_app_meta_data->>'provider','email') as p, count(*) as c from auth.users group by 1) x),
    'catalog', (select jsonb_build_object('total', count(*) filter (where deleted_at is null), 'visible', count(*) filter (where private.visible(c)), 'films', count(*) filter (where ty='films' and deleted_at is null),
                 'cartoons', count(*) filter (where ty='cartoons' and deleted_at is null), 'series', count(*) filter (where ty='series' and deleted_at is null),
                 'drafts', count(*) filter (where pub_status='draft' and deleted_at is null), 'avg_imdb', round(avg(rating_imdb) filter (where private.visible(c)), 2)) from public.content c),
    'last_audit', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (select a.actor_email, a.action, a.target, a.at from public.admin_audit a order by a.at desc limit 10) x)
  ) into res;
  return res;
end $$;
