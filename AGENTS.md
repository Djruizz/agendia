# Agendia — Guía de Arquitectura para Agentes

## Stack

- **Nuxt 4** + **@nuxt/ui v4** (overlay components: `UModal`, `UDrawer`)
- **@nuxtjs/supabase** + **@tanstack/vue-query**
- **Zod** para schemas
- **TypeScript**

## Patrón de Componentes CRUD

Cada dominio (`Appointment`, `Client`, `Service`) sigue la misma separación de responsabilidades:

### 1. `*Card.vue` y `*List.vue` — Presentacionales puros

- Reciben **props**, emiten **eventos**.
- **Nunca** importan composables de mutación (`useCreateX`, `useDeleteX`, etc.).
- **Nunca** renderizan modales/drawers.
- Son reusables en contextos read-only (dashboard, widgets, vistas anidadas).

```vue
<!-- AppointmentCard.vue -->
const emit = defineEmits<{ edit: [appointment: AppointmentWithRelations];
delete: [appointment: AppointmentWithRelations]; // ... }>();
```

### 2. `*Modal.vue` y `*Drawer.vue` — Autocontenidos

- `v-model:open` propio.
- Internamente llaman a las mutaciones (`useCreateX`, `useUpdateX`, `useDeleteX`).
- Manejan toasts de éxito/error.
- Cierran su propio `open` al terminar.
- Emiten eventos (`edit`, `delete`) si la UI padre debe orquestar otros modales (ej. `AppointmentDetailDrawer` reusa `AppointmentDeleteModal`).

```vue
<!-- AppointmentDeleteModal.vue -->
const open = defineModel<boolean>("open", { default: false });
const { mutateAsync: deleteAppointment } = useDeleteAppointment();
async function onConfirm() { /* ... */ open.value = false; }
```

### 3. Orquestación: Página o `*Manager.vue`

**Regla: solo crear un `*Manager.vue` cuando haya 2+ consumidores del mismo flujo CRUD.**

Mientras haya 1 consumidor, la página orquesta directamente. Ejemplos:

| Consumidores | Solución                                         |
| ------------ | ------------------------------------------------ |
| 1 página     | Página orquesta refs + handlers + monta `*Modal` |
| 2+ páginas   | `*Manager.vue` que encapsula todo el flujo       |

### API del `*Manager.vue` (cuando aplique)

- **Props**: data cruda (`appointments`, `loading`, `hasMore`, etc.). **Nunca** trae data internamente — cada página usa su propio hook (ej. `useInfiniteAppointments`, `useAppointmentsByDay`).
- **v-model**: filtros que la página debe alimentar al hook (`statusFilter`).
- **Emits**: eventos del List que la página debe propagar al hook (`loadMore`, `statusChange`).
- **`defineExpose({ openCreate })`**: para que la página dispare la creación desde su header sin meter el modal en ella.

```vue
<!-- Página consumidora -->
<AppointmentManager
  ref="manager"
  v-model:status-filter="statusFilter"
  :appointments="appointmentsList"
  :loading="isFetching"
  :has-more="hasNextPage"
  @load-more="fetchNextPage"
/>

<UButton @click="manager?.openCreate()" />
```

## Reglas de Negocio Importantes

### Appointment no tiene soft-delete

- `useDeleteAppointment` hace **hard delete** (`.delete()` en Supabase).
- El "restore" en `AppointmentCard` es en realidad **uncancel**: cambia `status` de `CANCELED` a `PENDING`.
- **Nunca** reutilices el texto "Podrás restaurarlo más tarde" del `ClientDeleteModal` — esa copia aplica solo a soft-delete.

### Acciones sin modal de confirmación
- **"Marcar reagendada"**: mutación directa con toast. **No es reversible** desde la UI (estado terminal de seguimiento).
- **"Cancelar cita"** (PENDING/CONFIRMED → CANCELED): mutación directa con toast. Reversible vía "Reactivar cita".
- **"Eliminar"**: SIEMPRE con `*DeleteModal` (destructivo).
- **"Reactivar cita"** (CANCELED → PENDING): con `*UncancelModal` (cambia estado, necesita confirmación). Disparado desde el Card dropdown y desde el DetailDrawer.

## Verificación

```bash
pnpm typecheck
```

## Convenciones de Naming

- Carpetas por dominio: `app/components/Appointment/`, `app/components/Client/`, `app/components/Service/`.
- Composables de queries: `app/composables/queries/useAppointments.ts`, `useInfiniteClients.ts`, etc.
- Composables de mutaciones: `app/composables/mutations/useCreateAppointment.ts`, `useDeleteClient.ts`, etc.
- Composables de utilidades: `app/composables/utils/DateUtils.ts`, `AppointmentStatus.ts`, `useAppointmentActions.ts`.

## Estructura de Carpetas

```
app/
  components/
    Appointment/
      AppointmentCard.vue         # presentacional
      AppointmentList.vue         # presentacional
      AppointmentForm.vue         # form (input)
      AppointmentModal.vue        # create/edit (autocontenido)
      AppointmentDeleteModal.vue  # delete (autocontenido)
      AppointmentUncancelModal.vue # CANCELED → PENDING (autocontenido)
      AppointmentDetailDrawer.vue # read-only + acciones (autocontenido)
      AppointmentManager.vue      # orquestador (2+ consumidores)
  composables/
    queries/
      useAppointments.ts
      useInfiniteAppointments.ts
      useAppointmentsByDay.ts
      useAppointmentCounts.ts
    mutations/
      useCreateAppointment.ts
      useUpdateAppointment.ts
      useDeleteAppointment.ts
    utils/
      AppointmentStatus.ts
      useAppointmentActions.ts
  schemas/
    appointments.ts               # Zod
  types/
    appointments.ts               # tipos derivados de database.types.ts
    database.types.ts             # generado de Supabase
```
