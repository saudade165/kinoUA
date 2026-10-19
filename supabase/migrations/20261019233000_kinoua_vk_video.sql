-- VK Video as a video source provider (same as YouTube/Vimeo: the admin pastes an embed code or link, only "oid_id[_hash]" is stored).
-- Applied to project xjkyudhahydookywtahh on 2026-10-19 (migration "kinoua_vk_video").
-- Rollback: delete from public.video_sources where provider = 'vk'; then restore the two constraints below without 'vk'.
alter table public.video_sources drop constraint video_sources_provider_check;
alter table public.video_sources add constraint video_sources_provider_check check (provider in ('youtube','vimeo','mp4','vk'));
alter table public.video_sources add constraint video_sources_vk_ref_check check (provider <> 'vk' or ref ~ '^-?\d{1,12}_\d{1,12}(_[0-9a-f]{4,40})?$');
