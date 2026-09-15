create or replace function public.is_slug_available(p_slug text)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.business_profiles
    where slug = lower(p_slug) and user_id != auth.uid()
  );
$$;

grant execute on function public.is_slug_available(text) to anon, authenticated;