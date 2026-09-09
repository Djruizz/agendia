alter table public.business_profiles
  add column if not exists brand_color text;

-- Seed: hereda el color actual de la preferencia del dueño (solo si es válido)
update public.business_profiles bp
set brand_color = up.settings->>'color_theme'
from public.user_preferences up
where up.user_id = bp.user_id
  and up.settings->>'color_theme' in (
    'red','orange','amber','yellow','lime','green','emerald','teal','cyan',
    'sky','blue','indigo','violet','purple','fuchsia','pink','rose'
  );