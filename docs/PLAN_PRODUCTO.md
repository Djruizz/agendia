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
- **Confirmar cambio de email** (toggle "Confirm email changes" en el panel) — el flujo de `SettingsAccountSecurity` depende de esto.

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
- Categoría o tipo de negocio (texto libre, opcional — agregado en migración de Fase 2 mini-migración).
- Teléfono o WhatsApp.
- Zona horaria.
- Primer servicio (opcional).

### Middleware

**Opción B aplicada**: `app/middleware/onboarding.ts` separado, aplicado en todas las páginas `workspace/*.vue` (`middleware: ["auth", "onboarding"]`). `auth.ts` queda intacto. El middleware lee/escribe la cache de TanStack vía `useNuxtApp().$queryClient` (los composables de vue-query no funcionan dentro de middleware por `inject()` sin instancia).

**Regla única**: si no existe fila en `business_profiles` para el usuario → redirigir a `/onboarding` (con `redirect` query param preservado). Esto aplica **uniformemente** a todo usuario sin perfil — no se distingue entre "nuevo" y "existente": el skip del onboarding crea un perfil mínimo y nunca más se le muestra.

**Falla abierta**: si el select a `business_profiles` falla (red, error), el middleware deja pasar (no bloquear el workspace por un fallo transitorio).

### Archivos

- `supabase/migrations/20260902_business_profiles_category.sql` — agregada columna `category text`.
- `app/middleware/onboarding.ts`
- `app/pages/onboarding.vue` — layout `auth`, orquestra mutaciones directo (sin Manager: 1 consumidor).
- `app/components/Business/BusinessOnboardingForm.vue` — presentacional (rol 1), reusa `ServiceForm.vue` para el paso 2.
- `app/composables/Business/utils/useSlug.ts` — `generateSlug()` (con strip de acentos NFD, crítico para español) + `useSlugAvailability()` con debounce de 500ms.

### Decisiones

- **Skip total = crear perfil mínimo**: `business_name = "Mi negocio"`, `slug = "negocio-<6 chars>"`, timezone default, `is_published = false`. Sin columnas ni flags extra; el usuario completa los datos reales en Fase 4 (settings).
- **Validación de slug en tiempo real es definitiva vía RPC `is_slug_available` (SECURITY DEFINER)**: la función expone solo un booleano y nunca revela slugs/estado de publicación. `user_id != auth.uid()` deja resuelto el caso de Fase 4 (tu propio slug actual cuenta como libre). El mapeo de `23505` en `useCreateBusinessProfile` se **mantiene** como red de seguridad para condición de carrera (dos usuarios verifican el mismo slug simultáneamente).
- **Categoría**: texto libre opcional (evita mantener una lista cerrada; normalizable después si Fase 5 lo requiere).
- **`auth/confirm.vue` no necesita cambios** — ya redirige a `/workspace`; el middleware intercepta.

### Tareas

- [x] Crear página `/onboarding` con layout `auth`.
- [x] Crear formulario de onboarding (datos del negocio + primer servicio opcional reusando `ServiceForm.vue`).
- [x] Generar slug automático a partir del nombre del negocio (con strip de acentos).
- [x] Validar unicidad de slug en tiempo real (debounce 500ms).
- [x] Crear `business_profiles` al completar onboarding (`useCreateBusinessProfile`).
- [x] Crear primer servicio si el usuario lo ingresó (`useCreateService` reusado).
- [x] Redirigir a `/workspace` (o `redirect` query param) al finalizar.
- [x] Implementar middleware de onboarding (`app/middleware/onboarding.ts`, Opción B).
- [x] Permitir saltar onboarding: skip total crea perfil mínimo → nunca más se le muestra.

## 7. Fase 4: Administración de cuenta

### Secciones en `/workspace/settings`

#### Perfil del negocio

- [x] Editar nombre del negocio.
- [x] Editar descripción.
- [x] Editar teléfono.
- [x] Cambiar logo (integrar `useUploadLogo` / `useRemoveLogo` ya existentes).
- [x] Cambiar slug con validación de unicidad (RPC `is_slug_available` excluye fila propia).
- [x] Activar o desactivar publicación (`is_published`).
- [x] Vista previa de la página pública — implementada junto con Fase 5.
- [x] Copiar enlace público.

#### Cuenta y seguridad

- [x] Mostrar email actual.
- [x] Cambiar email (`supabase.auth.updateUser`) — *pendiente validar "Confirm email changes" en el panel de Supabase*.
- [x] Cambiar contraseña (`supabase.auth.updateUser`).
- [x] Cerrar sesión (`supabase.auth.signOut`).

#### Preferencias existentes

- [x] Tema visual (claro/oscuro/sistema) — ya implementado.
- [x] Color de la aplicación — ya implementado.
- [x] Formato de hora — ya implementado.
- [x] Semanas para recordar — ya implementado.

#### Zona peligrosa

- [ ] Solicitar eliminación de cuenta — **diferida post-validación**.
- [ ] No borrar usuarios directamente desde el navegador.
- [ ] Usar una Edge Function o endpoint seguro para eliminar la cuenta y sus datos.
- [ ] Confirmar con contraseña antes de solicitar eliminación.

> **Por qué se difiere la Zona Peligrosa**: (1) no hay usuarios reales todavía (alineado con §12 — validar primero), (2) `professional_id` en `appointments`/`clients`/`services` **no tiene FK a `auth.users`** → un `auth.admin.deleteUser` no borra en cascada citas/clientes/servicios; requiere cleanup manual en server, (3) introduce Edge Functions + deploy por CLI + manejo de `SUPABASE_SERVICE_ROLE_KEY` como secreto nuevo — un workflow de infraestructura que no existe todavía en el proyecto.

### Archivos

- `app/components/Settings/SettingsBusinessProfile.vue` — sección orquestadora (form + logo + slug + publicación + copiar enlace).
- `app/components/Settings/SettingsSlugInput.vue` — editor de slug autocontenido con `useSlugAvailability` + `useUpdateBusinessProfile`.
- `app/components/Settings/SettingsAccountSecurity.vue` — email (modal), contraseña (modal), cerrar sesión.
- `app/composables/Business/storage/useUserLogo.ts` — movido desde `User/storage/` (autoimports por nombre); `useRemoveLogo` perdió la invalidación incorrecta de `["user-preferences"]` — ahora es remoción pura de storage; la cache la maneja el orquestador vía `useUpdateBusinessProfile` (`setQueryData`).
- `app/schemas/business.ts` — `businessProfileEditSchema = businessSchema.omit({ slug: true })`.
- `app/schemas/auth.ts` — `changeEmailSchema` + `changePasswordSchema`.
- `app/pages/workspace/settings.vue` — sección "Perfil del negocio" primero, "Cuenta y seguridad" al final.

### Decisiones

- **Logo: borrar el anterior al subir uno nuevo** (evita huérfanos en `logos/{user_id}/`); la operación es silenciosa (`.catch(() => {})`) porque si falla, el nuevo logo ya está puesto y el huérfano queda — aceptable, no bloquea.
- **Vista previa pública diferida a Fase 5**: solo se implementa el botón copiar por ahora; el botón "Vista previa" se agregará cuando exista `/p/[slug]`.
- **Cambio de email**: comportamiento (confirmación automática al nuevo correo) depende del toggle "Confirm email changes" del panel — agregado a las validaciones pendientes como las de Fase 1.
- **Sin migraciones** en esta fase: todo UI + wiring de composables existentes.

### Tareas

- [x] Crear `SettingsBusinessProfile` con formulario de edición.
- [x] Crear `SettingsAccountSecurity` con cambio de email y contraseña.
- [ ] `SettingsDangerZone` con solicitud de eliminación — **diferida** (ver Zona peligrosa arriba).
- [x] Integrar subida de logo real (`useUploadLogo`).
- [x] Copiar enlace público (vista previa diferida a Fase 5).
- [x] Añadir secciones a `workspace/settings.vue`.

## 8. Fase 5: Página pública

### Ruta

```text
/p/[slug]
```

### Contenido

- Nombre del negocio.
- Descripción.
- Logo.
- Color de marca de la página (campo `business_profiles.brand_color`, independiente de la preferencia personal de color).
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

- [x] Crear layout `public.vue` (header mínimo, sin navegación de workspace).
- [x] Crear página `/p/[slug]` con datos del negocio y servicios.
- [x] Crear query pública `usePublicBusiness` (por slug).
- [x] Crear query pública `usePublicServices` (por `professional_id` del negocio).
- [x] Crear componentes presentacionales públicos.
- [x] Manejar estado de negocio no encontrado o no publicado.
- [x] Botón de contacto por WhatsApp.
- [x] Diseño responsive y mobile-first.

### Decisiones

- **Acceso para el dueño pre-publicación**: `usePublicBusiness` no filtra `is_published` — la RLS decide: anon recibe `null` si el negocio no está publicado; el **dueño logueado sí ve su propio perfil** aunque esté en borrador → el botón "Vista previa" funciona antes de activar la publicación. Sin código condicional en el cliente.
- **Policy de services** (`20260902_services_public_read.sql`): `for select using (is_active = true and exists (select 1 from business_profiles where user_id = services.professional_id and is_published = true))`. El subquery en la policy corre con privilegios del owner → bypassa RLS de `business_profiles`, sin recursión. Es OR con la policy propia del dueño → no la afecta.
- **Estado "no disponible"** inline (no 404 duro): mantiene el layout público + link a la landing. Más amigable y consistente con el SPA.
- **Sección de servicios**: oculta si no hay activos (header + contacto siguen siendo útiles).
- **WhatsApp**: `https://wa.me/<digits>?text=Hola {nombre del negocio}, me interesa agendar una cita.` Teléfono sanitizado (solo dígitos). Botón solo se muestra si hay teléfono.
- **Footer "Hecho con Agendia"**: marketing gratuito cuando los profesionales comparten su página.
- **`useSeoMeta`** reactivo: title/description/og con datos del negocio.
- **Sin migraciones de schema** en esta fase — solo policies (no afectan tipos generados → no requiere `pnpm gen-types`).
- **Color de marca** (`brand_color` en `business_profiles`): el color del branding de la página pública vive como dato comercial del negocio, no como preferencia personal. La columna se expone automáticamente por la policy `public_read_published` existente. La siembra inicial del campo hereda el `color_theme` actual del dueño (si es válido) para que la primera elección del usuario quede como color de su página. Se aplica al `appConfig.ui.colors.primary` en runtime con snapshot al montar la página y restauración en `onUnmounted` (mismo mecanismo reactivo que `SettingsColorSelect`) — solo afecta la vista de la página pública.

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
