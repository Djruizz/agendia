-- Agregar columna socials a business_profiles con límite de 5 elementos
alter table public.business_profiles
  add column if not exists socials jsonb not null default '[]'::jsonb;

-- Asegurar que socials sea un array y no exceda 5 elementos
alter table public.business_profiles
  drop constraint if exists business_profiles_socials_max_5;

alter table public.business_profiles
  add constraint business_profiles_socials_max_5
  check (
    jsonb_typeof(socials) = 'array' and
    jsonb_array_length(socials) <= 5
  );
