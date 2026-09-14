# Plan de correcciones — post-bloqueantes

Estado al 2026-09-14: los 4 bloqueantes de lanzamiento están resueltos (ver "Ya resuelto" al final). Este es el backlog maestro del gap analysis; cada apartado se puede pedir como plan individual de implementación.

Escala de esfuerzo: S (< 1 h) · M (1–3 h) · L (3 h +)

## P1 — Antes de lanzar (riesgo, confusión de usuario o config faltante)

| #  | Corrección                              | Dónde                                                                | Esfuerzo | Notas                                                                                                                                                                                             |
|----|-----------------------------------------|----------------------------------------------------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | `.env.example` con variables requeridas | raíz (archivo nuevo)                                                 | S        | `NUXT_PUBLIC_SUPABASE_URL` y `NUXT_PUBLIC_SUPABASE_KEY`. Hoy solo existe `.env` (gitignored) — un clon fresco falla silenciosamente.                                                              |
| 2  | Backup de DB verificado                 | dashboard Supabase (Database → Backups)                             | S        | Confirmar PITR activo o export manual pre-lanzamiento. Sin esto no hay rollback ante desastre.                                                                                                    |
| 3  | Toasts crudos de mutaciones             | modales en `app/components/{Appointment,Client,Service,Settings}/`  | M        | Reemplazar `err?.message` en los `onError` por copy en español (sin conexión / duplicado / error desconocido). Hoy expone errores crudos de Supabase/Postgres al usuario.                           |
| 4  | `price` acepta negativos en el form     | `app/schemas/appointments.ts:15`                                     | S        | Falta `.min(0)`. La DB ya lo bloquea (CHECK desde `20260914`), pero el form no valida — verificar también `schemas/services.ts`.                                                                    |
| 5  | Copy mentiroso en borrado de cliente    | `app/components/Client/ClientDeleteModal.vue:54`                    | S        | "Podrás restaurarlo más tarde" — no existe UI de restore. Opción A: quitar la frase; Opción B: resolver junto al restore de P2-8.                                                                  |
| 6  | Sentry muerto                           | `nuxt.config.ts`                                                     | S        | Módulo integrado con DSN vacío: o setear el DSN o desactivar el módulo (hoy solo agrega peso al bundle sin reportar nada).                                                                         |
| 7  | WhatsApp link sin sanitizar             | `app/components/Appointment/AppointmentDetailDrawer.vue:342` y `app/composables/Appointment/utils/AppointmentActions.ts:15` | S | Interpolan `phone` crudo en `wa.me/${phone}`. Reusar el patrón `digits` (strip de no-dígitos) de `PublicBusinessHeader.vue:9-16`.                                                            |

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
