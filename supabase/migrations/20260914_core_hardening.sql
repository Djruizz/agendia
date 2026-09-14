-- Hardening: índices, semántica de FKs, NOT NULL y sanity checks (aplicado vía SQL editor 2026-09-14)

-- Índices para queries owner-scoped (RLS filtra por professional_id en cada query)
create index if not exists idx_appointments_professional_date on public.appointments (professional_id, date desc);
create index if not exists idx_appointments_professional_status on public.appointments (professional_id, status);
create index if not exists idx_clients_professional on public.clients (professional_id);
create index if not exists idx_services_professional on public.services (professional_id);

-- FKs con semántica explícita: el soft-delete es el único camino de borrado
alter table public.appointments
  drop constraint appointments_client_id_fkey,
  add constraint appointments_client_id_fkey foreign key (client_id) references public.clients(id) on delete restrict;

alter table public.appointments
  drop constraint appointments_service_id_fkey,
  add constraint appointments_service_id_fkey foreign key (service_id) references public.services(id) on delete restrict;

-- Columnas owner NOT NULL
alter table public.clients alter column professional_id set not null;
alter table public.services alter column professional_id set not null;

-- Sanity checks numéricos
alter table public.appointments add constraint appointments_price_check check (price is null or price >= 0);
alter table public.appointments add constraint appointments_duration_check check (duration_minutes > 0);
alter table public.services add constraint services_price_check check (price is null or price >= 0);
alter table public.services add constraint services_duration_check check (duration_minutes is null or duration_minutes > 0);
