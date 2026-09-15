-- Business profiles (datos comerciales del negocio, 1:1 con auth.users)
create table public.business_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  owner_name text,
  slug text unique not null,
  description text,
  phone text,
  timezone text not null default 'America/Mexico_City',
  logo_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_profiles_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60)
);

alter table public.business_profiles enable row level security;

create policy "select_own_profile" on public.business_profiles
  for select using (auth.uid() = user_id);

-- Lectura pública solo cuando is_published = true
create policy "public_read_published" on public.business_profiles
  for select using (is_published = true);

create policy "insert_own_profile" on public.business_profiles
  for insert with check (auth.uid() = user_id);

create policy "update_own_profile" on public.business_profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- El logo pasa a vivir en business_profiles.logo_path (era ghost code en user_preferences)
update public.user_preferences
set settings = settings - 'business_logo_path'
where settings ? 'business_logo_path';
