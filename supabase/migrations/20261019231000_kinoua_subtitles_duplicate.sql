-- admin_duplicate(): also copies subtitles of the title and of its episodes (same file URLs; files are shared, dropFile() keeps a file while anything references it).
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_subtitles_duplicate").
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
  insert into public.subtitles(content_id,lang,label,url,is_default,enabled,position) select nid,lang,label,url,is_default,enabled,position from public.subtitles where content_id = p_id;
  for s in select * from public.seasons where content_id = p_id loop
    insert into public.seasons(content_id,number,title,description,year,position) values (nid,s.number,s.title,s.description,s.year,s.position) returning id into nsid;
    for e in select * from public.episodes where season_id = s.id loop
      insert into public.episodes(season_id,number,title,description,air_date,runtime_min,still,status,position) values (nsid,e.number,e.title,e.description,e.air_date,e.runtime_min,e.still,e.status,e.position) returning id into neid;
      insert into public.video_sources(episode_id,provider,ref,label,lang,is_default,enabled,position) select neid,provider,ref,label,lang,is_default,enabled,position from public.video_sources where episode_id = e.id;
      insert into public.subtitles(episode_id,lang,label,url,is_default,enabled,position) select neid,lang,label,url,is_default,enabled,position from public.subtitles where episode_id = e.id;
    end loop;
  end loop;
  return jsonb_build_object('id', nid, 'slug', nslug);
end $$;
revoke all on function public.admin_duplicate(uuid) from public, anon;
grant execute on function public.admin_duplicate(uuid) to authenticated;
