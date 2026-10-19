-- Subtitles (WebVTT/SRT) for films and episodes: table + RLS, .vtt uploads to the media bucket, subtitles in public_title()/admin_preview() and subtitle languages in the catalog.
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_subtitles").
-- Rollback: restore private.compact/private.detail from 20261019193756_kinoua_cms_rpc.sql; drop table public.subtitles; remove 'text/vtt' from storage.buckets.allowed_mime_types for 'media'.

create table public.subtitles (
  id          uuid primary key default gen_random_uuid(),
  content_id  uuid references public.content(id) on delete cascade,
  episode_id  uuid references public.episodes(id) on delete cascade,
  lang        text not null check (lang ~ '^[a-z]{2,3}$'),
  label       text check (char_length(label) <= 80),
  url         text not null check (char_length(url) <= 1000 and url ~ '^(assets/subs/[a-z0-9._-]+\.vtt|https://[^\s"''<>]+)$'),
  is_default  boolean not null default false,
  enabled     boolean not null default true,
  position    int not null default 0,
  created_at  timestamptz not null default now(),
  check ((content_id is null) <> (episode_id is null))
);
create index subtitles_content_idx on public.subtitles (content_id);
create index subtitles_episode_idx on public.subtitles (episode_id);

alter table public.subtitles enable row level security;
create policy "admins read subtitles" on public.subtitles for select to authenticated using ((select public.admin_role()) is not null);
create policy "admins insert subtitles" on public.subtitles for insert to authenticated with check ((select public.admin_role()) is not null);
create policy "admins update subtitles" on public.subtitles for update to authenticated using ((select public.admin_role()) is not null) with check ((select public.admin_role()) is not null);
create policy "admins delete subtitles" on public.subtitles for delete to authenticated using ((select public.admin_role()) is not null);
grant select, insert, update, delete on public.subtitles to authenticated;
revoke all on public.subtitles from anon;

-- файли субтитрів адміністратори завантажують у той самий бакет (папка content/<id>/subs)
update storage.buckets set allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','text/vtt'] where id = 'media';

-- Повна сторінка тайтла: + 'subs' у фільму й серій
create or replace function private.detail(c public.content, p_admin boolean) returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'd', c.description, 'tagline', c.tagline, 'crew', c.crew, 'cast', c.cast_list, 'olang', c.orig_lang, 'dateRegion', c.date_region,
    'seasons', coalesce((select jsonb_agg(jsonb_build_object('n', s.number, 'year', s.year, 'title', s.title, 'ov', s.description,
        'eps', coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('n', e.number, 'name', e.title, 'date', e.air_date, 'rt', e.runtime_min, 'ov', e.description, 'still', e.still, 'status', e.status,
            'src', case when e.status = 'published' or p_admin then (select jsonb_agg(jsonb_build_object('provider', v.provider, 'ref', v.ref, 'label', v.label, 'lang', v.lang, 'def', v.is_default) order by v.is_default desc, v.position)
                       from public.video_sources v where v.episode_id = e.id and v.enabled) end,
            'subs', case when e.status = 'published' or p_admin then (select jsonb_agg(jsonb_build_object('lang', st.lang, 'label', st.label, 'url', st.url, 'def', st.is_default) order by st.position)
                       from public.subtitles st where st.episode_id = e.id and st.enabled) end)) order by e.position, e.number)
            from public.episodes e where e.season_id = s.id and (e.status <> 'hidden' or p_admin)), '[]'::jsonb)) order by s.position, s.number)
      from public.seasons s where s.content_id = c.id), '[]'::jsonb),
    'withCast', coalesce((select jsonb_agg(w) from jsonb_array_elements(c.with_cast) w where p_admin or exists (select 1 from public.content o where o.slug = w->>'id' and private.visible(o))), '[]'::jsonb),
    'images', coalesce((select jsonb_agg(jsonb_build_object('role', i.role, 'path', i.path, 'caption', i.caption) order by i.role, i.position) from public.content_images i where i.content_id = c.id), '[]'::jsonb),
    'src', coalesce((select jsonb_agg(jsonb_build_object('provider', v.provider, 'ref', v.ref, 'label', v.label, 'lang', v.lang, 'def', v.is_default) order by v.is_default desc, v.position)
                     from public.video_sources v where v.content_id = c.id and v.enabled), '[]'::jsonb),
    'subs', coalesce((select jsonb_agg(jsonb_build_object('lang', st.lang, 'label', st.label, 'url', st.url, 'def', st.is_default) order by st.position)
                     from public.subtitles st where st.content_id = c.id and st.enabled), '[]'::jsonb)
  )
$$;

-- Картка каталогу: мови субтитрів = вказані вручну + ті, для яких є файли (фільм або опубліковані серії)
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
    's', coalesce((select to_jsonb(array_agg(distinct z.l order by z.l)) from (
            select unnest(c.subs_langs) l
            union select st.lang from public.subtitles st where st.enabled and (st.content_id = c.id or st.episode_id in (
               select e.id from public.episodes e join public.seasons s on s.id = e.season_id where s.content_id = c.id and e.status = 'published'))) z),
          to_jsonb(c.subs_langs)),
    'ol', c.orig_lang, 'imdb', c.imdb_id, 'lvl', c.lvl,
    'audio', to_jsonb(c.audio_langs), 'countries', to_jsonb(c.countries), 'tags', to_jsonb(c.tags),
    'sc', case when c.ty = 'series' then (select count(*) from public.seasons s where s.content_id = c.id and exists (select 1 from public.episodes e where e.season_id = s.id and e.status <> 'hidden')) end,
    'ec', case when c.ty = 'series' then (select count(*) from public.episodes e join public.seasons s on s.id = e.season_id where s.content_id = c.id and e.status <> 'hidden') end,
    'det', true, 'add', (c.created_at at time zone 'utc')::date
  ))
$$;
revoke all on all functions in schema private from public, anon, authenticated;

-- Субтитри двох відкритих фільмів (файли в assets/subs/ репозиторію)
insert into public.subtitles (content_id, lang, label, url, is_default, position)
select c.id, x.lang, x.label, 'assets/subs/' || c.slug || '.' || x.lang || '.vtt', x.lang = 'uk', x.pos
from public.content c
join (values ('uk','Українська',0), ('en','English',1), ('ru','Русский',2)) x(lang, label, pos) on true
where c.slug in ('sintel-2010', 'tears-of-steel-2012');
update public.content set description = jsonb_set(description, '{uk}', to_jsonb(replace(description->>'uk', 'називає Лускою', 'називає Лускатим'))) where slug = 'sintel-2010';
update public.content set description = jsonb_set(description, '{ru}', to_jsonb(replace(description->>'ru', 'называет Чешуйкой', 'называет Чешуйчиком'))) where slug = 'sintel-2010';
