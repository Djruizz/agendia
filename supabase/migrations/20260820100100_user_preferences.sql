-- User preferences (per-user JSONB settings)
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "select_own_prefs" on public.user_preferences
  for select using (auth.uid() = user_id);

create policy "upsert_own_prefs" on public.user_preferences
  for insert with check (auth.uid() = user_id);

create policy "update_own_prefs" on public.user_preferences
  for update using (auth.uid() = user_id);