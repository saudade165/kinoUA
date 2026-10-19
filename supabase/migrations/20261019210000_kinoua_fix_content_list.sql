-- Fix: admin_content_list cast a CTE row (with extra views/genres columns) to public.content -> "cannot cast type record to public.content". Visibility is now computed inline (same rule as private.visible).
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_fix_content_list").

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
        'views', b.views, 'rating_imdb', b.rating_imdb, 'visible', (b.deleted_at is null and (b.pub_status = 'published' or (b.pub_status = 'scheduled' and b.publish_at <= now())))))
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
