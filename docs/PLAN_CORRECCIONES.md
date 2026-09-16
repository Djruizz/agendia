# Plan de correcciones — post-bloqueantes

Estado al 2026-09-14: los 4 bloqueantes de lanzamiento están resueltos (ver "Ya resuelto" al final). Este es el backlog maestro del gap analysis; cada apartado se puede pedir como plan individual de implementación.

**Cerrado al 2026-09-15**: backlog completo — todos los ítems resueltos o dispositionados (P3-21 cerrado sin ejecutar, ver al final). Este documento queda como registro histórico.

Escala de esfuerzo: S (< 1 h) · M (1–3 h) · L (3 h +)

## P1 — Antes de lanzar (riesgo, confusión de usuario o config faltante)

**Implementado y verificado al 2026-09-15** (detalle en "Ya resuelto"). Los 7 ítems completos — P1-2 (backup de DB) verificado por el usuario con export manual pre-lanzamiento.

## P2 — Calidad post-lanzamiento

**Implementado el 2026-09-15** (detalle en "Ya resuelto"). Los 8 ítems (#8–#16) quedaron cubiertos: 6 implementados, 1 ya resuelto previamente (#15) y 1 era un no-gap (#16).

## P3 — Higiene / infra (opcional)

**2026-09-15**: implementado completo. P3-17 directo; P3-18/P3-19 en el repo; P3-20 ejecutado por el usuario con el CLI (historial remoto reconciliado — `migration list` muestra Local = Remote en las 9 migrations, incluidas `20260901` y `20260914` marcadas como aplicadas); P3-21 cerrado sin ejecutar (decisión del usuario — ver al final). Detalle en "Ya resuelto".

## Ya resuelto (no re-auditar)

- **B1** — `app/error.vue` global con branding (404 vs error, CTAs en español).
- **B2/B3** — Estados de error de red diferenciados de vacío (`App/QueryErrorState.vue`) en appointments, clients, services, calendar, dashboard, earnings y página pública.
- **B4** — Errores de auth legibles (`app/utils/authErrors.ts`) en login, register y forgot-password (incl. reenvío de confirmación).
- **A4** — Soft-delete de servicios (`is_active = false` + invalidación de queries públicas).
- **A1–A3** — Schema core versionado (`20260901_core_tables.sql`) + hardening aplicado y verificado (`20260914_core_hardening.sql`: índices owner-scoped, FKs a RESTRICT, NOT NULL en `professional_id`, CHECKs numéricos).
- Triggers `updated_at` y FKs `→ auth.users CASCADE`: confirmados existentes en DB durante la auditoría (no eran gap real).
- **P1-1** — `.env.example` en raíz con `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY` (públicas por diseño) y `NUXT_PUBLIC_SENTRY_DSN` opcional.
- **P1-2** — Backup de DB verificado el 2026-09-15: export manual pre-lanzamiento realizado por el usuario (dashboard de Supabase, Database → Backups).
- **P1-3** — Toasts de mutaciones traducidos: `app/utils/mutationErrors.ts` (`describeMutationError` + `FriendlyError` para passthrough de errores ya traducidos por las mutaciones). Aplicado en 18 catches (modales de Appointment/Client/Service, Settings, onboarding); `SettingsAccountSecurity` usa `describeAuthError`.
- **P1-4** — `.min(0)` en `price` de `app/schemas/appointments.ts` + guard de negativos en `AppointmentCompleteModal` (bypassea el schema). `schemas/services.ts` ya tenía `.min(1)` — verificado.
- **P1-5** — Frase "Podrás restaurarlo más tarde" removida de `ClientDeleteModal` (no existe UI de restore; revertir junto a P2-8 si se construye).
- **P1-6** — Sentry verificado vivo: `NUXT_PUBLIC_SENTRY_DSN` (en `.env`) sobreescribe `runtimeConfig.public.sentryDsn` y `sentry.{client,server}.config.ts` inicializan con guard. El gap era solo discoverability en clones frescos → resuelto por `.env.example`.
- **P1-7** — Teléfono sanitizado (solo dígitos, patrón `PublicBusinessHeader`) en `AppointmentActions.sanitizePhone` y `AppointmentDetailDrawer` (`whatsappUrl` computed).
- **P2-8** — UI de reactivación para clientes/servicios: filtro Activos/Inactivos en `ClientList`/`ServiceList` (`v-model:active-filter`, incluido en queryKey de `useInfiniteClients`/`useServices`), acción "Reactivar" en el dropdown de cards inactivos (`is_active = true` vía `useUpdateClient`/`useUpdateService` orquestado desde la página), badge "Inactivo". `useUpdateService` ahora invalida `["appointments"]` y `["public-services"]` además de `["services"]` (espejo del soft-delete). Copy honesto restituido en `ClientDeleteModal` y `ServiceDeleteModal` ("Podrás reactivarlo más tarde desde el filtro de inactivos").
- **P2-9** — Race en preferencias: `useUpdateUserPreferences` serializa saves concurrentes con una cola a nivel módulo; cada save hace merge sobre el resultado del anterior (dos campos salvados a la vez ya no se pisan).
- **P2-10** — Onboarding fail-closed: `onboarding.ts` reintenta el chequeo de `business_profiles` (2 intentos, 500ms de espera) y si persiste el fallo lanza `createError` fatal → página de error global (el CTA "Ir a mi agenda" reintenta el middleware).
- **P2-11** — `removeEventListener` en `onUnmounted` de `SettingsColorSelect` (antes: leak del listener `resize`).
- **P2-12** — Empty states con CTA: "Crear mi primer cliente / servicio / cita" en `ClientList`/`ServiceList`/`AppointmentList` (emiten `create`; sin CTA cuando hay búsqueda activa o filtro de estado/Inactivos).
- **P2-13** — Detección offline: `useNetworkStatus()` (composables/shared/utils, listeners únicos a nivel módulo, idempotente) + toast persistente "Sin conexión" (`duration: Infinity`, soportado nativamente por el Toast de @nuxt/ui) y toast de reconexión, activado en `layouts/workspace.vue`.
- **P2-14** — aria-labels en todos los botones icon-only: headers de páginas (refrescar/crear), dropdowns de cards, prev/next del calendario y settings del header.
- **P2-15** — No-gap de código: el item "Ver historial" ya había sido removido de `ClientCard` (commit b3449d2); era un hallazgo de auditoría desactualizado.
- **P2-16** — No-gap: `@nuxt/ui` v4 depende de `@nuxt/fonts` y lo registra automáticamente, por lo que la fuente declarada en `main.css` (`--font-sans: "Plus Jakarta Sans"`) sí se carga y self-hostea.
- **P3-17** — 17 paquetes `@tiptap/*` removidos de `package.json` (ningún componente los usaba; verificado con grep en `app/` y repo). `pnpm typecheck` OK.
- **P3-18** — Edge Function `delete-account` documentada en `supabase/README.md`: contrato con el cliente (endpoint, headers, body, respuestas), consideraciones de seguridad (verify JWT desactivado + validación manual, CASCADE vía FK a `auth.users`) y pasos para moverla al repo si se desea.
- **P3-19** — Migrations con prefijos duplicados renombradas a timestamps únicos (`git mv`): `2× 20260820_*` → `20260820100000/100100`, `5× 20260902_*` → `20260902100000`–`20260902100400`. Referencias actualizadas en AGENTS.md y PLAN_PRODUCTO.md.
- **P3-20** — Resuelto el 2026-09-15 por el usuario: `migration repair` ejecutado con el CLI (login + reverted de `20260820`/`20260902`, applied de las 7 versiones renombradas y de `20260901`/`20260914`). `migration list --linked` muestra Local = Remote en las 9 migrations; `db push`/`db pull` vuelven a ser seguros.

## Cerrado sin ejecutar

- **P3-21** — **Decisión del usuario (2026-09-15)**: Docker Desktop no se instalará. `supabase start`/`db reset` local para verificar el replay de migrations queda como opción documentada en `supabase/README.md` por si se retoma en el futuro. No requerido para lanzar.
