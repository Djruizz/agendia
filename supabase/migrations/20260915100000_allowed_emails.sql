-- Allowlist de registro (2026-09-15)
-- Gateo del signup a nivel DB: trigger BEFORE INSERT en auth.users rechaza
-- emails no invitados (fail-closed). Hoy se invita manual (INSERT por SQL
-- editor / dashboard). Flujo post-compra futuro: insertar en allowed_emails
-- ANTES de auth.admin.createUser (el trigger bloquea también inserts del
-- service role — el orden importa). Lanzamiento público: dropear
-- trg_signup_allowlist (y opcionalmente trg_signup_allowlist_audit + tabla).

create table public.allowed_emails (
  email text primary key,
  added_by text not null default 'manual',
  user_id uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  registered_at timestamptz
);

alter table public.allowed_emails enable row level security;
-- Sin policies: solo postgres / service role leen y escriben.

-- Sembrar emails ya registrados al momento del deploy: pueden re-registrarse
-- si borraron su cuenta (los usuarios existentes no pasan por INSERT, el
-- trigger solo afecta signups nuevos).
insert into public.allowed_emails (email, added_by)
select lower(email), 'seed' from auth.users where email is not null;

create or replace function public.assert_signup_allowed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null
     or not exists (
       select 1 from public.allowed_emails
       where lower(email) = lower(new.email)
     ) then
    raise exception 'AGENDIA_SIGNUP_NOT_ALLOWED: este email no tiene invitación para registrarse'
      using errcode = '28000';
  end if;
  return new;
end;
$$;

create trigger trg_signup_allowlist
  before insert on auth.users
  for each row execute function public.assert_signup_allowed();

create or replace function public.mark_signup_consumed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.allowed_emails
  set user_id = new.id,
      registered_at = now()
  where lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger trg_signup_allowlist_audit
  after insert on auth.users
  for each row execute function public.mark_signup_consumed();
