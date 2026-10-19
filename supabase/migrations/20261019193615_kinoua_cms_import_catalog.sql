-- One-time import of the existing static catalog (140 titles, 46 seasons, 429 episodes, 19 genres) into the CMS tables.
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_cms_import_catalog"). Do NOT re-run on a database that already has data.
-- Source pinned to an immutable commit (tools/seed/kinoua-catalog-seed.json); its sha256 is verified before anything is written.
create extension if not exists http with schema extensions;

do $$
declare
  body text; j jsonb; t jsonb; g jsonb; se jsonb; e jsonb; cid uuid; sid uuid; i int; k int;
begin
  select content into body from extensions.http_get('https://raw.githubusercontent.com/saudade165/kinoUA/9ea21b4b254c46ffeb9c527c7c6cee40a2a4c480/tools/seed/kinoua-catalog-seed.json');
  if encode(extensions.digest(convert_to(body,'UTF8'),'sha256'),'hex') <> 'c370dd4600b50a20a5a3944262778c14c1b9aff32a3b5e87549d42dfa3b5b6f1' then
    raise exception 'seed checksum mismatch';
  end if;
  j := body::jsonb;

  alter table public.content disable trigger stamp_content;
  alter table public.content disable trigger audit_content;
  alter table public.genres disable trigger audit_genres;

  for g in select * from jsonb_array_elements(j->'genres') loop
    insert into public.genres(slug,icon,name_uk,name_ru,name_en,sections,position)
    values (g->>'slug', g->>'icon', g->>'uk', g->>'ru', g->>'en', array(select jsonb_array_elements_text(g->'sections')), (g->>'position')::int);
  end loop;

  for t in select * from jsonb_array_elements(j->'titles') loop
    insert into public.content(slug,ty,title_orig,title_uk,title_ru,short,description,tagline,year,premiere_date,date_region,cert,cert_region,runtime_min,release_status,orig_lang,subs_langs,
      rating_imdb,rating_imdb_votes,rating_tmdb,imdb_id,tmdb_id,pop_rank,editorial_rank,trailer_yt,trailer_name,poster,backdrop,lvl,cast_list,crew,with_cast,pub_status,created_at,updated_at,created_by,updated_by)
    values (t->>'id', t->>'ty', t->>'t', t->'n'->>'uk', t->'n'->>'ru',
      case when jsonb_typeof(t->'sd')='object' then t->'sd' else '{}' end,
      case when jsonb_typeof(t->'detail'->'d')='object' then t->'detail'->'d' else '{}' end,
      case when jsonb_typeof(t->'detail'->'tagline')='object' then t->'detail'->'tagline' else '{}' end,
      (t->>'y')::int, (t->>'date')::date, t->'detail'->>'dateRegion', t->'cert'->>'v', t->'cert'->>'region', nullif((t->>'m')::int,0), coalesce(t->>'status','released'), t->>'ol',
      case when jsonb_typeof(t->'s')='array' then array(select jsonb_array_elements_text(t->'s')) else null end,
      (select (r->>'v')::numeric from jsonb_array_elements(case when jsonb_typeof(t->'ratings')='array' then t->'ratings' else '[]' end) r where r->>'src'='IMDb'),
      (select (r->>'votes')::int from jsonb_array_elements(case when jsonb_typeof(t->'ratings')='array' then t->'ratings' else '[]' end) r where r->>'src'='IMDb'),
      (select (r->>'v')::numeric from jsonb_array_elements(case when jsonb_typeof(t->'ratings')='array' then t->'ratings' else '[]' end) r where r->>'src'='TMDB'),
      t->>'imdb', (t->>'tmdb')::int, (t->>'pop')::int, (t->>'rank')::int,
      case when jsonb_typeof(t->'trailer')='object' then t->'trailer'->>'yt' end, case when jsonb_typeof(t->'trailer')='object' then t->'trailer'->>'name' end,
      t->>'poster', t->>'backdrop',
      case when jsonb_typeof(t->'lvl')='object' then t->'lvl' else null end,
      case when jsonb_typeof(t->'detail'->'cast')='array' then t->'detail'->'cast' else '[]' end,
      case when jsonb_typeof(t->'detail'->'crew')='array' then t->'detail'->'crew' else '[]' end,
      case when jsonb_typeof(t->'detail'->'withCast')='array' then t->'detail'->'withCast' else '[]' end,
      'published', ((coalesce(t->>'add','2026-10-18'))||'T12:00:00Z')::timestamptz, now(), 'import', 'import')
    returning id into cid;
    i := 0;
    for g in select * from jsonb_array_elements(case when jsonb_typeof(t->'g')='array' then t->'g' else '[]' end) loop
      insert into public.content_genres(content_id,genre_slug,position) values (cid, g#>>'{}', i); i := i + 1;
    end loop;
    i := 0;
    for se in select * from jsonb_array_elements(case when jsonb_typeof(t->'detail'->'seasons')='array' then t->'detail'->'seasons' else '[]' end) loop
      insert into public.seasons(content_id,number,year,position) values (cid,(se->>'n')::int,(se->>'year')::int,i) returning id into sid; i := i + 1;
      k := 0;
      for e in select * from jsonb_array_elements(case when jsonb_typeof(se->'eps')='array' then se->'eps' else '[]' end) loop
        insert into public.episodes(season_id,number,title,description,air_date,runtime_min,still,status,position)
        values (sid,(e->>'n')::int,e->>'name',case when jsonb_typeof(e->'ov')='object' then e->'ov' else '{}' end,(e->>'date')::date,nullif((e->>'rt')::int,0),e->>'still','published',k); k := k + 1;
      end loop;
    end loop;
  end loop;

  alter table public.content enable trigger stamp_content;
  alter table public.content enable trigger audit_content;
  alter table public.genres enable trigger audit_genres;
end $$;

drop extension http;

insert into public.categories(slug,title,kind,enabled,position,max_items,system) values
 ('hero',     '{"uk":"Головний банер","ru":"Главный баннер","en":"Hero banner"}','hero',true,0,6,true),
 ('editors',  '{"uk":"Рекомендації редакції","ru":"Рекомендации редакции","en":"Editor’s picks"}','manual',true,1,20,true),
 ('popular',  '{"uk":"Популярні фільми","ru":"Популярные фильмы","en":"Popular movies"}','builtin',true,2,100,true),
 ('cartoons', '{"uk":"Мультфільми","ru":"Мультфильмы","en":"Cartoons"}','builtin',true,3,30,true),
 ('series',   '{"uk":"Серіали","ru":"Сериалы","en":"Series"}','builtin',true,4,10,true),
 ('new',      '{"uk":"Нещодавно вийшли","ru":"Недавно вышли","en":"Just released"}','auto_new',true,5,6,true),
 ('upcoming', '{"uk":"Скоро вийде","ru":"Скоро выйдет","en":"Coming soon"}','auto_upcoming',true,6,12,true);

-- Перенесення старих таблиць версії 4.3: title_flags (1 запис: тайтл опубліковано) і recommendations (порожня) замінені content.pub_status і category_items.
update public.content c set pub_status = case when f.hidden then 'hidden' else 'published' end from public.title_flags f where f.title_id = c.slug;
insert into public.category_items(category_slug,content_id,position,note) select 'editors', c.id, r.position, r.note from public.recommendations r join public.content c on c.slug = r.title_id;
drop table public.recommendations;
drop table public.title_flags;
