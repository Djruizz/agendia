# Plan de Producto — Agendia

## 1. Objetivo

Construir una agenda para profesionales independientes donde cada usuario pueda:

- Administrar sus citas.
- Administrar clientes y servicios.
- Personalizar su negocio.
- Tener una página pública básica.
- Eventualmente contratar una suscripción.

## 2. Decisiones iniciales

- Un usuario representa un negocio.
- No habrá equipos ni empleados inicialmente.
- Supabase Auth administrará emails, contraseñas y sesiones.
- Los datos del negocio estarán separados de `user_preferences`.
- La página pública mostrará servicios y datos comerciales, no clientes ni citas.
- La página pública no tendrá reservas online inicialmente.
- Las suscripciones se implementarán después de validar el producto con usuarios reales.

## 3. Estado actual

### Registro — IMPLEMENTADO

- `/register` — registro con email, contraseña y confirmación.
- `/login` — login + enlaces a registro y recuperación.
- `/forgot-password` — solicitud de reset por email.
- `/reset-password` — nueva contraseña + confirmación.
- `/auth/confirm` — callback de confirmación de email (`exchangeCodeForSession`).
- Schema de autenticación en `app/schemas/auth.ts` (`loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema`).
- Redirección a `/workspace` tras login o confirmación.

### Pendiente de validar

- URLs permitidas en el panel de Supabase (`/auth/confirm` y `/reset-password`).
- Envío real de emails desde Supabase.
- Confirmación desde distintos dispositivos.
- Recuperación de contraseña en producción.
- Comportamiento con enlaces expirados o ya usados.

## 4. Fase 1: Autenticación

### Rutas

```text
/login
/register
/forgot-password
/reset-password
/auth/confirm
```

### Tareas

- [x] Validar email.
- [x] Exigir contraseña de mínimo 8 caracteres.
- [x] Confirmar contraseña.
- [x] Mostrar errores claros (email duplicado, credenciales inválidas).
- [x] Confirmar email antes de permitir acceso.
- [x] Permitir recuperar contraseña.
- [x] Permitir cambiar contraseña.
- [x] Cerrar sesión correctamente (Header.vue).
- [x] Redirigir usuarios autenticados fuera de login y registro.
- [x] Preservar la ruta original cuando un usuario no autenticado intenta entrar a una ruta protegida (redirect query param).
- [x] Validar URLs permitidas en el panel de Supabase.
- [x] Validar envío real de emails en producción.

## 5. Fase 2: Perfil del negocio

### Tabla `business_profiles`

```sql
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
  updated_at timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "select_own_profile" on public.business_profiles
  for select using (auth.uid() = user_id);

create policy "insert_own_profile" on public.business_profiles
  for insert with check (auth.uid() = user_id);

create policy "update_own_profile" on public.business_profiles
  for update using (auth.uid() = user_id);

-- Lectura pública solo cuando is_published = true
create policy "public_read_published" on public.business_profiles
  for select using (is_published = true);
```

### Reglas

- `user_id` será la relación con `auth.users`.
- `slug` será único y se guardará en minúsculas.
- No se duplicará la contraseña ni el email en una tabla propia.
- El email se administrará mediante Supabase Auth.
- `user_preferences` conservará únicamente preferencias de la aplicación (color, formato de hora, semanas para recordar).
- `business_profiles` contendrá los datos comerciales del negocio.
- `logo_path` y `timezone` viven únicamente en `business_profiles`: son datos comerciales y la página pública (Fase 5) necesita leerlos de forma anónima vía la policy `public_read_published`. `user_preferences` es owner-only por RLS y no debe abrirse a lectura pública.
- `business_logo_path` en `app/schemas/preferences.ts` es ghost code (sin UI ni consumidores) — se elimina en esta fase. `useUploadLogo`/`useRemoveLogo` se integran en Fase 4, persistiendo en `business_profiles.logo_path` (invalidación `["business-profile"]`).

### Archivos a crear

- `supabase/migrations/<fecha>_business_profiles.sql`
- `app/types/business.ts` — tipos del dominio (`BusinessProfile`, `BusinessProfileInsert`, `BusinessProfileUpdate`).
- `app/schemas/business.ts` — schema Zod para validación de formularios.
- `app/composables/Business/queries/useBusinessProfile.ts`
- `app/composables/Business/mutations/useCreateBusinessProfile.ts`
- `app/composables/Business/mutations/useUpdateBusinessProfile.ts`

### Tareas

- [x] Crear migración `business_profiles` con RLS (constraint `check` de slug `^[a-z0-9]+(-[a-z0-9]+)*$` max 60, `with check` en policy de update).
- [x] Incluir limpieza defensiva en la migración: `update user_preferences set settings = settings - 'business_logo_path' where settings ? 'business_logo_path'`.
- [x] Eliminar `business_logo_path` y `LOGO_PATH_REGEX` de `app/schemas/preferences.ts`.
- [x] Regenerar tipos (`pnpm gen-types`).
- [x] Crear tipos del dominio en `app/types/business.ts`.
- [x] Crear schema Zod en `app/schemas/business.ts`.
- [x] Crear composable `useBusinessProfile` (query por `user_id`).
- [x] Crear composable `useCreateBusinessProfile` (insert + upsert slug).
- [x] Crear composable `useUpdateBusinessProfile` (update parcial).
- [x] Cache en mutaciones onSuccess: `setQueryData(["business-profile", user_id])` — las mutaciones conocen el estado final (insert/update con `select`). Normalizar slug (lowercase/trim) y mapear error `23505` a mensaje amigable desde la mutación.

## 6. Fase 3: Onboarding

### Ruta

```text
/onboarding
```

### Flujo

1. Usuario confirma su email.
2. Ingresa a `/auth/confirm`.
3. El sistema verifica si tiene perfil completo.
4. Si no lo tiene, redirige a `/onboarding`.
5. Completa los datos básicos del negocio.
6. Crea opcionalmente su primer servicio.
7. Entra a `/workspace`.

### Datos mínimos

- Nombre del negocio.
- Nombre del profesional.
- Categoría o tipo de negocio.
- Teléfono o WhatsApp.
- Zona horaria.
- Primer servicio (opcional).

### Middleware

Crear lógica de protección para evitar que un usuario incompleto acceda al workspace sin haber completado el onboarding:

- Opción A: extender `app/middleware/auth.ts` para verificar `business_profiles` y redirigir a `/onboarding` si no existe.
- Opción B: crear `app/middleware/onboarding.ts` separado y aplicarlo en `workspace/*.vue`.

### Archivos a crear

- `app/pages/onboarding.vue`
- `app/components/Business/BusinessOnboardingForm.vue` (o reutilizar `BusinessForm.vue`)
- `app/composables/Business/utils/useSlug.ts` — generación y validación de slug.

### Tareas

- [ ] Crear página `/onboarding` con layout `auth` o `workspace`.
- [ ] Crear formulario de onboarding (datos del negocio + primer servicio opcional).
- [ ] Generar slug automático a partir del nombre del negocio.
- [ ] Validar unicidad de slug en tiempo real.
- [ ] Crear `business_profiles` al completar onboarding.
- [ ] Crear primer servicio si el usuario lo ingresó.
- [ ] Redirigir a `/workspace` al finalizar.
- [ ] Implementar middleware de onboarding.
- [ ] Permitir saltar onboarding y completarlo después.

## 7. Fase 4: Administración de cuenta

### Secciones en `/workspace/settings`

#### Perfil del negocio

- [ ] Editar nombre del negocio.
- [ ] Editar descripción.
- [ ] Editar teléfono.
- [ ] Cambiar logo (integrar `useUploadLogo` / `useRemoveLogo` ya existentes).
- [ ] Cambiar slug con validación de unicidad.
- [ ] Activar o desactivar publicación (`is_published`).
- [ ] Vista previa de la página pública.
- [ ] Copiar enlace público.

#### Cuenta y seguridad

- [ ] Mostrar email actual.
- [ ] Cambiar email (`supabase.auth.updateUser`).
- [ ] Cambiar contraseña (`supabase.auth.updateUser`).
- [ ] Cerrar sesión (`supabase.auth.signOut`).

#### Preferencias existentes

- [ ] Tema visual (claro/oscuro/sistema) — ya implementado.
- [ ] Color de la aplicación — ya implementado.
- [ ] Formato de hora — ya implementado.
- [ ] Semanas para recordar — ya implementado.

#### Zona peligrosa

- [ ] Solicitar eliminación de cuenta.
- [ ] No borrar usuarios directamente desde el navegador.
- [ ] Usar una Edge Function o endpoint seguro para eliminar la cuenta y sus datos.
- [ ] Confirmar con contraseña antes de solicitar eliminación.

### Archivos a crear

- `app/components/Settings/SettingsBusinessProfile.vue`
- `app/components/Settings/SettingsAccountSecurity.vue`
- `app/components/Settings/SettingsDangerZone.vue`
- `app/components/Settings/SettingsSlugInput.vue`

### Tareas

- [ ] Crear `SettingsBusinessProfile` con formulario de edición.
- [ ] Crear `SettingsAccountSecurity` con cambio de email y contraseña.
- [ ] Crear `SettingsDangerZone` con solicitud de eliminación.
- [ ] Integrar subida de logo real (`useUploadLogo`).
- [ ] Mostrar vista previa y enlace público.
- [ ] Añadir secciones a `workspace/settings.vue`.

## 8. Fase 5: Página pública

### Ruta

```text
/p/[slug]
```

### Contenido

- Nombre del negocio.
- Descripción.
- Logo.
- Servicios activos (`is_active = true`).
- Precio y duración de cada servicio.
- Teléfono o WhatsApp.
- Botón de contacto por WhatsApp.
- Redes sociales (si se agregan posteriormente).

### Seguridad

- No mostrar clientes.
- No mostrar citas.
- No mostrar preferencias privadas.
- No consultar directamente datos privados desde acceso anónimo.
- Usar una vista, función RPC o consulta específica para datos públicos.
- `business_profiles` requiere política RLS de lectura pública solo cuando `is_published = true`.
- `services` requiere política RLS de lectura pública solo cuando `is_active = true` y el negocio está publicado.

### Archivos a crear

- `app/pages/p/[slug].vue`
- `app/components/Public/PublicBusinessHeader.vue`
- `app/components/Public/PublicServiceList.vue`
- `app/components/Public/PublicServiceCard.vue`
- `app/composables/Business/queries/usePublicBusiness.ts`
- `app/composables/Business/queries/usePublicServices.ts`
- `app/layouts/public.vue`

### Tareas

- [ ] Crear layout `public.vue` (header mínimo, sin navegación de workspace).
- [ ] Crear página `/p/[slug]` con datos del negocio y servicios.
- [ ] Crear query pública `usePublicBusiness` (por slug).
- [ ] Crear query pública `usePublicServices` (por `professional_id` del negocio).
- [ ] Crear componentes presentacionales públicos.
- [ ] Manejar estado de negocio no encontrado o no publicado.
- [ ] Botón de contacto por WhatsApp.
- [ ] Diseño responsive y mobile-first.

## 9. Fase 6: Reservas online

> Esta fase queda después de validar la página pública con usuarios reales.

### Requeriría

- Horarios laborales por negocio.
- Descansos y días no disponibles.
- Duración de servicios.
- Prevención de citas superpuestas.
- Formulario público para clientes.
- Confirmación, cancelación y reprogramación.
- Notificaciones por email o WhatsApp.
- Posible modelo de cita pública vs. cita interna.

### Tareas (borrador)

- [ ] Definir tabla `business_hours` o almacenar en `business_profiles.settings`.
- [ ] Definir tabla `blocked_slots` o `time_off`.
- [ ] Crear flujo público de reserva paso a paso.
- [ ] Crear o reutilizar cliente anónimo (¿cliente temporal sin cuenta?).
- [ ] Validar disponibilidad en tiempo real.
- [ ] Confirmar reserva con email/WhatsApp.
- [ ] Sincronizar con `appointments` existente.

## 10. Fase 7: Suscripciones

> No implementar hasta tener usuarios activos y evidencia de disposición a pagar.

### Cuando llegue el momento

- [ ] Definir planes (free, pro, etc.).
- [ ] Definir límites y funcionalidades por plan.
- [ ] Crear tabla `subscriptions`.
- [ ] Integrar Stripe u otro proveedor de pagos.
- [ ] Procesar webhooks desde backend (Edge Function).
- [ ] No confiar en el frontend para validar pagos.
- [ ] Controlar acceso mediante estado real de suscripción.
- [ ] Implementar cancelaciones y periodos vencidos.
- [ ] Implementar prueba gratuita (trial).

## 11. Verificación de cada fase

Después de modificar código:

```bash
pnpm typecheck
```

Si se modificó el schema de DB:

```bash
pnpm gen-types
```

### Validación manual

- Registro exitoso.
- Email duplicado.
- Email no confirmado.
- Email confirmado.
- Contraseña incorrecta.
- Recuperación de contraseña.
- Enlace expirado.
- Logout.
- Acceso a rutas protegidas sin sesión.
- Aislamiento de datos entre usuarios (RLS).
- Onboarding completo y skip.
- Página pública sin exposición de información privada.
- Página pública de negocio no publicado (debe dar 404 o "no disponible").

## 12. Fuera de alcance inicial

- Equipos y empleados.
- Roles y permisos avanzados.
- Google OAuth u otros proveedores.
- Reservas online.
- Notificaciones automáticas.
- Pagos y suscripciones.
- Reportes avanzados.
- Aplicación multi-negocio por usuario.

## 13. Orden de implementación recomendado

1. ~~Fase 1: Autenticación~~ — completar tareas pendientes (tareas de código completadas; restan validaciones de panel Supabase en producción).
2. **Fase 2: Perfil del negocio** — crear `business_profiles` y composables.
3. **Fase 3: Onboarding** — asistente inicial tras registro.
4. **Fase 4: Administración de cuenta** — extender settings.
5. **Fase 5: Página pública** — ruta `/p/[slug]`.
6. Validar con 5-10 profesionales reales.
7. Fase 6: Reservas online (si hay demanda).
8. Fase 7: Suscripciones (si hay disposición a pagar).
