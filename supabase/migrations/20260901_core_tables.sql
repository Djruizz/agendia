-- Core domain tables: enum + clients, services, appointments (recuperadas de prod 2026-09-14)
create type public.appointment_status as enum ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED');

create table public.clients (
  id uuid not null default gen_random_uuid() primary key,
  professional_id uuid references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  client_since date default now(),
  is_active boolean not null default true
);

create table public.services (
  id uuid not null default gen_random_uuid() primary key,
  professional_id uuid references auth.users(id) on delete cascade,
  name text not null,
  duration_minutes numeric,
  price numeric,
  description text,
  created_at timestamptz default now(),
  is_active boolean not null default true
);

create table public.appointments (
  id uuid not null default gen_random_uuid() primary key,
  professional_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  client_id uuid not null,
  service_id uuid,
  date timestamptz not null,
  price numeric(10,2),
  duration_minutes integer not null,
  notes text,
  status public.appointment_status not null default 'PENDING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  followed_up boolean not null default false,
  constraint appointments_client_id_fkey foreign key (client_id) references public.clients(id) on delete set null,
  constraint appointments_service_id_fkey foreign key (service_id) references public.services(id) on delete set null
);

alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;

create policy "Professional can see own clients" on public.clients
  for all to authenticated using (professional_id = auth.uid()) with check (professional_id = auth.uid());

create policy "Professional has all permisions on own services" on public.services
  for all to authenticated using (professional_id = auth.uid()) with check (professional_id = auth.uid());

create policy "Professional has all permissions on own appointments" on public.appointments
  for all to authenticated using (professional_id = auth.uid()) with check (professional_id = auth.uid());

create index idx_appointments_client on public.appointments (client_id);
create index idx_appointments_date on public.appointments (date);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_client_updated_at()
returns trigger language plpgsql as $$
begin
  update public.clients
  set updated_at = now()
  where id = new.client_id;
  return new;
end;
$$;

create trigger trg_appointments_updated before update on public.appointments
  for each row execute function public.set_updated_at();

create trigger trg_touch_client_on_appointment after insert or update on public.appointments
  for each row execute function public.touch_client_updated_at();

create trigger trg_clients_updated before update on public.clients
  for each row execute function public.set_updated_at();
