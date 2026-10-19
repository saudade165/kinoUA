-- KinoUA: шаблон таблиць для майбутньої синхронізації профілю, обраного й історії.
-- ЗАРАЗ НЕ ВИКОНАНО: сайт зберігає ці дані лише в браузері. Запустіть у Supabase → SQL Editor, коли додасте синхронізацію.
-- Row Level Security увімкнено на кожній таблиці: користувач бачить і змінює лише власні рядки (auth.uid()).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ui_lang text check (ui_lang in ('uk','ru','en')),
  theme text check (theme in ('dark','light','auto')),
  subs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id text not null,
  added_at timestamptz not null default now(),
  primary key (user_id, title_id)
);
create table if not exists public.history (
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id text not null,
  viewed_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

alter table public.profiles  enable row level security;
alter table public.favorites enable row level security;
alter table public.history   enable row level security;

-- Лише автентифіковані користувачі й лише власні дані. Анонімний доступ (роль anon) не надається.
create policy "own profile: select" on public.profiles  for select to authenticated using ((select auth.uid()) = id);
create policy "own profile: insert" on public.profiles  for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile: update" on public.profiles  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own favorites: select" on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy "own favorites: insert" on public.favorites for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own favorites: delete" on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);

create policy "own history: select" on public.history for select to authenticated using ((select auth.uid()) = user_id);
create policy "own history: insert" on public.history for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own history: update" on public.history for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own history: delete" on public.history for delete to authenticated using ((select auth.uid()) = user_id);
