<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { AppointmentWithRelations } from "~/types/appointments";
import {
  appointmentSchema,
  type AppointmentSchema,
} from "~/schemas/appointments";

const props = defineProps<{
  mode?: "create" | "edit";
  appointment?: AppointmentWithRelations;
}>();

const emit = defineEmits<{
  submit: [payload: AppointmentSchema];
  cancel: [];
}>();

const { data: clients } = useClients({
  sortBy: "name",
  asc: true,
});
const { data: services } = useServices();
const { getStatusLabel } = AppointmentStatus();

const statusItems = computed(() => [
  { label: getStatusLabel("PENDING"), value: "PENDING" },
  { label: getStatusLabel("CONFIRMED"), value: "CONFIRMED" },
  { label: getStatusLabel("COMPLETED"), value: "COMPLETED" },
  { label: getStatusLabel("CANCELED"), value: "CANCELED" },
]);

const initialDate = props.appointment?.date
  ? new Date(props.appointment.date)
  : new Date();

const state = reactive<AppointmentSchema>({
  client_id: "",
  service_id: undefined,
  date: formatDateInput(initialDate),
  time: formatTimeInput(initialDate),
  duration_minutes: 30,
  status: "PENDING",
  price: undefined,
  notes: "",
});

const durationMinutes = computed({
  get: () => state.duration_minutes ?? 0,
  set: (val: number) => {
    state.duration_minutes = val;
  },
});
type ClientItem = {
  label: string;
  value: string;
  isActive: boolean;
};
const clientItems = computed(() => {
  const items: ClientItem[] = [];
  const currentClient = props.appointment?.clients;
  if (currentClient && !clients.value?.some((c) => c.id === currentClient.id)) {
    items.push({
      label: `${currentClient.name}`,
      value: currentClient.id,
      isActive: currentClient.is_active,
    });
  }
  items.push(
    ...(clients.value?.map((c) => ({
      label: c.name,
      value: c.id,
      isActive: c.is_active,
    })) ?? []),
  );
  return items;
});

type ServiceItem = {
  label: string;
  value: string | undefined;
  isActive: boolean;
};
const serviceItems = computed(() => {
  const items: ServiceItem[] = [
    { label: "Sin servicio", value: undefined, isActive: true },
  ];
  const currentService = props.appointment?.services;
  if (
    currentService &&
    !services.value?.some((s) => s.id === currentService.id)
  ) {
    items.push({
      label: `${currentService.name} (inactivo)`,
      value: currentService.id,
      isActive: currentService.is_active,
    });
  }
  items.push(
    ...(services.value?.map((s) => ({
      label: s.name,
      value: s.id,
      isActive: s.is_active,
    })) ?? []),
  );
  return items;
});

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

watch(
  () => props.appointment,
  (val) => {
    const d = val?.date ? new Date(val.date) : new Date();
    state.client_id = val?.client_id ?? "";
    state.service_id = val?.service_id ?? undefined;
    state.date = formatDateInput(d);
    state.time = formatTimeInput(d);
    state.duration_minutes = val?.duration_minutes ?? 30;
    state.status = val?.status ?? "PENDING";
    state.price = val?.price ?? undefined;
    state.notes = val?.notes ?? "";
    formRef.value?.clearErrors();
  },
  { immediate: true },
);

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTimeInput(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function onSubmit(event: FormSubmitEvent<AppointmentSchema>) {
  emit("submit", {
    client_id: event.data.client_id,
    service_id: event.data.service_id || undefined,
    date: event.data.date,
    time: event.data.time,
    duration_minutes: event.data.duration_minutes,
    status: event.data.status,
    price: event.data.price,
    notes: event.data.notes?.trim() || undefined,
  });
}

const updateDuration = () => {
  if (state.service_id === undefined) {
    state.duration_minutes = 30;
    return;
  }
  state.duration_minutes =
    services.value?.find((s) => s.id === state.service_id)?.duration_minutes ??
    30;
};
</script>

<template>
  <UForm
    id="appointment-form"
    ref="formRef"
    :schema="appointmentSchema"
    :state="state"
    class="grid grid-cols-2 gap-4"
    @submit="onSubmit"
  >
    <UFormField name="client_id" label="Cliente" required class="col-span-2">
      <USelectMenu
        v-model="state.client_id"
        :items="clientItems"
        :search-input="{ placeholder: 'Buscar cliente' }"
        value-key="value"
        placeholder="Selecciona un cliente"
        icon="i-lucide-user"
        class="w-full"
      >
        <template #item-label="{ item }">
          <span :class="{ 'text-muted line-through': !item.isActive }">
            {{ item.label }}
          </span>
          <span v-if="!item.isActive" class="text-xs text-error ml-1">
            (eliminado)
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField name="service_id" label="Servicio" class="col-span-2">
      <USelectMenu
        v-model="state.service_id"
        :items="serviceItems"
        value-key="value"
        :search-input="{ placeholder: 'Buscar servicio' }"
        placeholder="Selecciona un servicio"
        icon="i-lucide-scissors"
        class="w-full"
        @change="updateDuration"
      >
        <template #item-label="{ item }">
          <span
            :class="{
              'text-muted line-through': !item.isActive,
              'opacity-50': item.value === undefined,
            }"
          >
            {{ item.label }}
          </span>
          <span
            v-if="!item.isActive && item.value !== ''"
            class="text-xs text-error ml-1"
          >
            (eliminado)
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField name="date" label="Fecha" required>
      <UInput
        v-model="state.date"
        type="date"
        icon="i-lucide-calendar-days"
        class="w-full"
      />
    </UFormField>

    <UFormField name="time" label="Hora" required>
      <UInput
        v-model="state.time"
        type="time"
        icon="i-lucide-clock"
        class="w-full"
      />
    </UFormField>

    <UFormField name="duration_minutes" label="Duración (minutos)" required>
      <UInput
        v-model.number="durationMinutes"
        type="number"
        min="1"
        placeholder="30"
        icon="i-lucide-clock"
        class="w-full"
      />
    </UFormField>

    <UFormField name="price" label="Precio (MXN)">
      <UInput
        v-model.number="state.price"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        icon="i-lucide-dollar-sign"
        class="w-full"
      />
    </UFormField>

    <UFormField
      v-if="mode !== 'edit'"
      name="status"
      label="Estado"
      required
      class="col-span-2"
    >
      <USelect
        v-model="state.status"
        :items="statusItems"
        icon="i-lucide-circle-dot"
        class="w-full"
      />
    </UFormField>

    <UFormField name="notes" label="Notas" class="col-span-2">
      <UTextarea
        v-model="state.notes"
        placeholder="Notas sobre la cita"
        :rows="3"
        autoresize
        :maxrows="5"
        class="w-full"
      />
    </UFormField>
  </UForm>
</template>
