# Agendia — Guía de Arquitectura para Agentes

App de agenda para profesionales (citas, clientes, servicios). SPA (Nuxt 4, `ssr: false`) sobre Supabase con cache de TanStack Query.

## Stack

- **Nuxt 4** + **`@nuxt/ui` v4** (overlays: `UModal`, `UDrawer`, `UDropdownMenu`).
- **`@nuxtjs/supabase`** (`redirect: false`, no redirige solo) + **`@tanstack/vue-query`** (instalado en `app/plugins/vue-query.ts`, `staleTime` 5 min, `retry: 1`).
- **Zod** para schemas de formularios (tipos derivados con `z.infer`).
- **`@vite-pwa/nuxt`** activo (PWA autoUpdate, `start_url: /workspace`).
- **`app.config.ts`** define `ui.colors.primary = "pink"`.

## Comandos

```bash
pnpm install        # corre `nuxi prepare` automáticamente (postinstall)
pnpm dev            # http://localhost:3000
pnpm typecheck      # nuxi typecheck (única verificación; no hay lint ni tests)
pnpm build / preview / generate
pnpm gen-types      # regenera app/types/database.types.ts desde Supabase CLI
```

Solo `typecheck` existe como check. No hay ESLint/Prettier ni test runner configurado — **no inventes comandos que no están en `package.json`**.

## Configuración obligatoria

- `.env` debe contener (mínimo):
  - `NUXT_PUBLIC_SUPABASE_URL`
  - `NUXT_PUBLIC_SUPABASE_KEY` (anon key; `@nuxtjs/supabase` lo lee automáticamente — si no está, el cliente falla silenciosamente)
- El script `gen-types` tiene el `project-id` de Supabase **hardcodeado** (`ivhbffyoxcjltawnjnma`). Si se migra de proyecto, hay que editarlo en `package.json:12`.

## Autenticación

- Middleware global en `app/middleware/auth.ts` aplicado en cada `app/pages/workspace/*.vue` vía `definePageMeta({ middleware: "auth" })`.
- `supabase.redirect = false` en `nuxt.config.ts`: el middleware hace el `navigateTo("/login")` manualmente.
- Si la sesión no está en storage pero hay usuario en `useSupabaseUser`, se rehidrata vía `supabase.auth.getSession()`.

## Patrón de Componentes CRUD

Tres roles por dominio (`Appointment`, `Client`, `Service`):

### 1. `*Card.vue` y `*List.vue` — Presentacionales puros

- Solo **props in / events out**. **Nunca** importan composables de mutación ni renderizan modales/drawers.
- Reusables en vistas read-only (dashboard, widgets, modales de confirmación).

### 2. `*Modal.vue` / `*Drawer.vue` — Autocontenidos

- `v-model:open` propio. Llaman internamente a `useCreateX`/`useUpdateX`/`useDeleteX`, manejan toasts y cierran su `open` al terminar.
- Emiten eventos (`edit`, `delete`, etc.) solo si un padre debe orquestar otros modales (caso típico: `AppointmentDetailDrawer` reusa modales).

### 3. `*Manager.vue` — Orquestador (solo con 2+ consumidores)

- Recibe **data cruda** como props, **nunca** fetchea internamente.
- `v-model` para filtros que la página alimenta al hook (`statusFilter`).
- Emits para `loadMore`, `statusChange`, etc.
- `defineExpose({ openCreate })` permite disparar creación desde el header de la página sin meter el modal en ella.
- **Único existente**: `AppointmentManager.vue` (consumido por `workspace/appointments.vue` y `workspace/calendar.vue`).
- `Client` y `Service` **no** tienen Manager — sus páginas orquestan directo (regla "1 consumidor = 0 indirection").

## Diferencias críticas entre dominios

| Operación                | `Appointment`          | `Client`                       | `Service`             |
| ------------------------ | ---------------------- | ------------------------------ | --------------------- |
| Eliminar                 | **Hard delete** (`.delete()`) | **Soft delete** (`is_active = false`) | **Hard delete** (`.delete()`) |
| "Recuperar"/restaurar    | `AppointmentUncancelModal` (CANCELED → PENDING, **no es restore real**) | Inexistente — se resetea `is_active` desde DB | Inexistente           |
| Reusar copy "Podrás restaurarlo más tarde" | ❌ Solo aplica a Client (soft-delete) | ✅ | ❌ |

### Acciones de cita sin modal de confirmación

- **"Marcar reagendada"**: mutación directa (`followed_up = true`), estado terminal de seguimiento. No reversible desde UI.
- **"Cancelar cita"** (PENDING/CONFIRMED → CANCELED): mutación directa. Reversible vía `AppointmentUncancelModal`.
- **"Eliminar"**: SIEMPRE con `AppointmentDeleteModal` (destructivo).
- **"Reactivar cita"** (CANCELED → PENDING): con `AppointmentUncancelModal`. Disparado desde `AppointmentCard` (dropdown "Recuperar") y desde `AppointmentDetailDrawer`.
- **"Avanzar estado"** (PENDING → CONFIRMED → COMPLETED): desde el Drawer. CONFIRMED→COMPLETED abre `AppointmentCompleteModal` (precio + notas).

### Estados seudo (no existen en DB)

`AppointmentStatusFilter` agrega dos valores que no son `appointment_status`:
- `REAGENDADA`: `COMPLETED && followed_up`
- `REMEMBER`: `COMPLETED && !followed_up && weeksSince(date) >= 3`

La query se construye en `useInfiniteAppointments.ts` con `buildPseudoQuery` (`.eq("status","COMPLETED")` + filtros extra). Definidos en `app/composables/utils/AppointmentStatus.ts`.

## Convenciones clave

- **Carpetas por dominio**: `app/components/{Appointment,Client,Service,Calendar,Layout}`.
- **Composables agrupados por dominio** (cada carpeta contiene sus propias `queries/`, `mutations/`, `utils/` cuando aplique):
  - `composables/Appointment/` — `queries/` (TanStack Query), `mutations/` (Create/Update/Delete), `utils/` (`AppointmentStatus()`, `AppointmentActions()`). Helpers se llaman como funciones: `const { getStatusColor } = AppointmentStatus();`.
  - `composables/Client/` — `queries/`, `mutations/`.
  - `composables/Service/` — `queries/`, `mutations/`.
  - `composables/Dashboard/` — `queries/` agregadas (`useMonthAppointmentCount`, `useMonthRevenue`, `useTotalClients`, `useUpcomingAppointments`).
  - `composables/User/` — `queries/`, `mutations/`, `storage/` (logo).
  - `composables/shared/utils/` — helpers cross-domain (`DateUtils()`).
  - Las mutaciones invalidan por queryKey raíz en `onSuccess` (ej. `["appointments"]` invalida list, day, counts).
- **`@nuxt/ui` autoimports**: composables (`useToast`, `useSupabaseClient`, `useSupabaseUser`, `useInfiniteQuery`, etc.) están disponibles globalmente — no importarlos manualmente salvo tipos.
- **`imports.dirs`** en `nuxt.config.ts` incluye `composables/**` y `types/**` para autoimports.
- **Tipos**: `app/types/database.types.ts` es generado (no editar a mano); wrappers de dominio en `app/types/{appointments,clients,services}.ts`.
- **Schemas Zod**: `app/schemas/{appointments,clients,services,auth}.ts`. Los forms usan `UForm :schema="..."` y emiten el payload al modal padre.
- **i18n hardcoded**: `DateUtils` usa `es-AR` por defecto; el formatea currency usa `es-MX`. **No hay sistema i18n** — todo el copy está inline en español.
- **`professional_id`**: cada insert en `appointments`, `clients`, `services` se le inyecta `user.value?.sub` desde la mutación (server lo autoriza via RLS).

## Quirks del código

- **`useAppointmentsByDay`** devuelve relaciones con nombres singulares (`client:clients(*)`, `service:services(*)`), mientras que las demás queries usan plural (`clients:clients(*)`, `services:services(*)`). El tipo `AppointmentWithRelations` usa plural — el componente `Calendar` confía en esto porque `useAppointmentsByDay` no se castea a `AppointmentWithRelations`.
- **`useAppointments`** existe pero **no lo usa ninguna página actual**. Los consumidores reales son `useInfiniteAppointments` (paginada), `useAppointmentsByDay` (calendario), `useAppointmentCounts` (badges del calendario).
- **`workspace/index.vue`** (Dashboard) es un stub con un form de servicio hardcodeado — no es la verdadera página de dashboard. No agregar features esperando que se rendericen ahí.
- **`ClientCard`** tiene un item de menú "Ver historial" que apunta a `/admin/clientes/{id}` — ruta **inexistente**. Si vas a habilitar historial, primero crear la ruta.
- **`AppointmentForm`** auto-ajusta `duration_minutes` cuando se elige un servicio (default 30 si no hay servicio). Tiene lógica para preservar cliente/servicio inactivo en el select.
- **`AppointmentCard` click** abre `AppointmentDetailDrawer`, pero **bloquea** la apertura si el cliente está inactivo (`is_active === false`) con un toast de error.
- **Mutaciones invalidan por queryKey raíz** (ej. `["appointments"]` invalida todas las variantes: list, day, counts). Borrar una cita o servicio refresca también otras vistas automáticamente.

## Estructura

```
app/
  app.vue, app.config.ts
  assets/css/main.css
  layouts/{auth,landing,workspace}.vue
  pages/
    index.vue              # landing pública
    login.vue              # UAuthForm + signInWithPassword
    workspace/
      index.vue            # dashboard (stub actual)
      clients.vue          # orquesta ClientList + ClientModal + ClientDeleteModal
      services.vue         # orquesta ServiceList + ServiceModal + ServiceDeleteModal
      appointments.vue     # usa AppointmentManager
      calendar.vue         # Calendar + useAppointmentsByDay + AppointmentManager
  middleware/auth.ts
  plugins/vue-query.ts
  components/{Appointment,Client,Service,Calendar,Layout}/
  composables/{queries,mutations,utils}/
  schemas/{auth,appointments,clients,services}.ts   # Zod
  types/{database.types,appointments,clients,services}.ts
supabase/.temp/linked-project.json                  # generado por Supabase CLI
```

## Verificación

Después de tocar código, **siempre**:

```bash
pnpm typecheck
```

Si tocás schema de DB, regenerá tipos:

```bash
pnpm gen-types
```

## Gotchas para no perder tiempo

- `.nuxt/` está en `.gitignore` y es requerido (lo crea `nuxi prepare` en postinstall). Si lo borrás y no corriste `pnpm install`, `pnpm typecheck` falla.
- No hay `tsconfig.json` propio que valide standalone — usa `references` a `.nuxt/tsconfig.*.json`. Typecheck solo funciona si `.nuxt/` existe.
- `tailwindcss` v4 + `@nuxt/ui` v4: **no** agregar `tailwind.config.js`; `@nuxt/ui` lo provee. Si necesitás utilidades custom, van en `app/assets/css/main.css` (ya está importado en `nuxt.config.ts`).
- Los iconos son **`i-lucide-*`** (Lucide). No uses otros sets.
- `@nuxt/ui` v4: `UModal` usa `v-model:open` (no `v-model`). Drawer también.
- `@tanstack/vue-query`: para mutaciones que afectan cache, importar `useQueryClient` desde el composable, no pasar el cliente manualmente.
- RLS en Supabase asume `professional_id = auth.uid()`. No asumas que cualquier usuario ve cualquier fila.
