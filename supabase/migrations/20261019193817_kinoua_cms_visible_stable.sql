-- private.visible() depends on now(): must be STABLE, not IMMUTABLE (otherwise scheduled publication could be evaluated once and cached).
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_cms_visible_stable"). Rollback: recreate with "immutable" (not recommended).
create or replace function private.visible(c public.content) returns boolean language sql stable set search_path = '' as $$
  select c.deleted_at is null and (c.pub_status = 'published' or (c.pub_status = 'scheduled' and c.publish_at <= now()))
$$;
revoke all on function private.visible(public.content) from public, anon, authenticated;
