-- Public read of active services, only when the business is published.
create policy "public_read_active_services"
  on public.services for select using (
    is_active = true
    and exists (
      select 1 from public.business_profiles bp
      where bp.user_id = services.professional_id
        and bp.is_published = true
    )
  );
