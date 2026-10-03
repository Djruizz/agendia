-- Agrega visibilidad pública y ruta de imagen a los servicios
alter table public.services add column if not exists is_public boolean not null default false;
alter table public.services add column if not exists image_path text null;

-- Migración segura: habilitar is_public para los primeros 6 servicios activos de cada profesional
with ranked_services as (
  select id, row_number() over (partition by professional_id order by created_at asc) as rn
  from public.services
  where is_active = true
)
update public.services
set is_public = true
where id in (select id from ranked_services where rn <= 6);

-- Función trigger para forzar el límite máximo de 6 servicios públicos activos por profesional
create or replace function public.check_max_public_services()
returns trigger language plpgsql as $$
begin
  if new.is_public = true and new.is_active = true then
    if (
      select count(*)
      from public.services
      where professional_id = new.professional_id
        and is_public = true
        and is_active = true
        and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 6 then
      raise exception 'Has alcanzado el límite máximo de 6 servicios públicos permitidos.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_check_max_public_services on public.services;
create trigger trg_check_max_public_services
  before insert or update on public.services
  for each row execute function public.check_max_public_services();

-- Actualizar política RLS para que usuarios anónimos solo lean servicios que sean activos Y públicos
drop policy if exists "public_read_active_services" on public.services;
create policy "public_read_active_services"
  on public.services for select using (
    is_active = true
    and is_public = true
    and exists (
      select 1 from public.business_profiles bp
      where bp.user_id = services.professional_id
        and bp.is_published = true
    )
  );

-- Políticas de Storage en bucket 'user-assets' para la carpeta 'services/'
-- Lectura pública para cualquier imagen bajo services/
create policy "public_read_services" on storage.objects
  for select using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'services'
  );

-- Escritura solo permitida en la carpeta propia: services/{user_id}/...
create policy "upload_own_services" on storage.objects
  for insert with check (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'services'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "update_own_services" on storage.objects
  for update using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'services'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

create policy "delete_own_services" on storage.objects
  for delete using (
    bucket_id = 'user-assets'
    and (storage.foldername(name))[1] = 'services'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
