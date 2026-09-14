# Plan de correcciones — post-bloqueantes

Estado al 2026-09-14: los 4 bloqueantes de lanzamiento están resueltos (ver "Ya resuelto" al final). Este es el backlog maestro del gap analysis; cada apartado se puede pedir como plan individual de implementación.

Escala de esfuerzo: S (< 1 h) · M (1–3 h) · L (3 h +)

## P1 — Antes de lanzar (riesgo, confusión de usuario o config faltante)

**Implementado el 2026-09-14** (detalle en "Ya resuelto"). Único pendiente: **P1-2 — backup de DB** (verificación manual en dashboard de Supabase: Database → Backups, confirmar PITR activo o export manual pre-lanzamiento).

## P2 — Calidad post-lanzamiento

| #  | Corrección                                | Dónde                                             | Esfuerzo | Notas                                                                                                                                                          |
|----|-------------------------------------------|---------------------------------------------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 8  | UI de restore para clientes/servicios     | `workspace/clients.vue` / `workspace/services.vue` | M–L      | Filtro "inactivos" + acción "Reactivar" (`is_active = true`). Desbloquea el copy honesto de P1-5 y del `ServiceDeleteModal`.                                      |
| 9  | Race en update de preferencias            | `app/composables/User/mutations/useUpdateUserPreferences.ts:14-18` | S–M   | Dos saves concurrentes se pisan (último gana). Mover a upsert atómico o merge por campo.                                                                        |
| 10 | Onboarding fail-open                      | `app/middleware/onboarding.ts`                    | S        | Si falla el chequeo de `business_profiles`, deja pasar al workspace. Endurecer: retry explícito o fail-closed con mensaje.                                      |
| 11 | Listeners leak en pickers de color        | `app/components/Settings/SettingsColorSelect.vue` | S        | `addEventListener` sin `removeEventListener` en unmount.                                                                                                       |
| 12 | Empty states sin CTA                      | listas de clients/services/appointments           | M        | Estado vacío con botón "Crear primer cliente / servicio / cita" que abre el modal correspondiente.                                                              |
| 13 | Detección offline (PWA)                   | composable global                                 | M        | `navigator.onLine` + eventos + toast persistente "Sin conexión". Complementa B2/B3 (hoy el error de red se muestra, pero sin aviso previo).                     |
| 14 | aria-labels faltantes                     | icon-only buttons (dropdowns, close, actions)     | M        | Auditoría de botones sin texto accesible en Card/Drawer/Modals.                                                                                                 |
| 15 | "Ver historial" apunta a ruta inexistente | `app/components/Client/ClientCard.vue`            | S        | El item abre `/admin/clientes/{id}` que no existe: ocultar el item o construir la ruta de historial.                                                            |
| 16 | Font del design system sin cargar         | `app/assets/css/main.css` / `nuxt.config.ts`      | S        | Verificar carga de la fuente de @nuxt/ui; hoy depende de fallbacks del sistema.                                                                                 |

## P3 — Higiene / infra (opcional)

| #  | Corrección                                  | Dónde                                | Esfuerzo | Notas                                                                                                                                                |
|----|---------------------------------------------|--------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| 17 | 17 paquetes @tiptap sin uso                 | `package.json:19-35`                 | S        | Ningún componente usa tiptap. `pnpm remove` + `pnpm typecheck`.                                                                                       |
| 18 | Edge Function "delete-account" fuera del repo | dashboard Supabase                 | M        | Mover a `supabase/functions/` para auditabilidad (verify JWT desactivado — se valida manual dentro de la función) o documentar su gestión actual.      |
| 19 | Prefijos duplicados en migrations viejas    | `supabase/migrations/` (2× 20260820, 5× 20260902) | S | Solo necesario si se vuelve a usar `db pull`/`db push` del CLI: renombrar a versiones únicas + `supabase migration repair`.               |
| 20 | Cleanup del historial remoto de migraciones | CLI                                  | S        | Los rows del repair a medias (20260820/20260902) quedaron inertes — cosmético.                                                                        |
| 21 | Docker Desktop para dev local               | máquina                              | M        | Habilita `supabase start`/`db reset` local y verificar el replay de migrations en entorno fresco. No requerido para lanzar.                          |

## Ya resuelto (no re-auditar)

- **B1** — `app/error.vue` global con branding (404 vs error, CTAs en español).
- **B2/B3** — Estados de error de red diferenciados de vacío (`App/QueryErrorState.vue`) en appointments, clients, services, calendar, dashboard, earnings y página pública.
- **B4** — Errores de auth legibles (`app/utils/authErrors.ts`) en login, register y forgot-password (incl. reenvío de confirmación).
- **A4** — Soft-delete de servicios (`is_active = false` + invalidación de queries públicas).
- **A1–A3** — Schema core versionado (`20260901_core_tables.sql`) + hardening aplicado y verificado (`20260914_core_hardening.sql`: índices owner-scoped, FKs a RESTRICT, NOT NULL en `professional_id`, CHECKs numéricos).
- Triggers `updated_at` y FKs `→ auth.users CASCADE`: confirmados existentes en DB durante la auditoría (no eran gap real).
- **P1-1** — `.env.example` en raíz con `NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_KEY` (públicas por diseño) y `NUXT_PUBLIC_SENTRY_DSN` opcional.
- **P1-3** — Toasts de mutaciones traducidos: `app/utils/mutationErrors.ts` (`describeMutationError` + `FriendlyError` para passthrough de errores ya traducidos por las mutaciones). Aplicado en 18 catches (modales de Appointment/Client/Service, Settings, onboarding); `SettingsAccountSecurity` usa `describeAuthError`.
- **P1-4** — `.min(0)` en `price` de `app/schemas/appointments.ts` + guard de negativos en `AppointmentCompleteModal` (bypassea el schema). `schemas/services.ts` ya tenía `.min(1)` — verificado.
- **P1-5** — Frase "Podrás restaurarlo más tarde" removida de `ClientDeleteModal` (no existe UI de restore; revertir junto a P2-8 si se construye).
- **P1-6** — Sentry verificado vivo: `NUXT_PUBLIC_SENTRY_DSN` (en `.env`) sobreescribe `runtimeConfig.public.sentryDsn` y `sentry.{client,server}.config.ts` inicializan con guard. El gap era solo discoverability en clones frescos → resuelto por `.env.example`.
- **P1-7** — Teléfono sanitizado (solo dígitos, patrón `PublicBusinessHeader`) en `AppointmentActions.sanitizePhone` y `AppointmentDetailDrawer` (`whatsappUrl` computed).
