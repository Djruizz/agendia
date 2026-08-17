<script setup lang="ts">
import type { AppointmentSchema } from "~/schemas/appointments";
import type { AppointmentWithRelations } from "~/types/appointments";

const props = defineProps<{
  mode?: "create" | "edit";
  appointment?: AppointmentWithRelations;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: createAppointment, isPending: creating } =
  useCreateAppointment();
const { mutateAsync: updateAppointment, isPending: updating } =
  useUpdateAppointment();
const toast = useToast();

const saving = computed(() => creating.value || updating.value);

function combineDateTime(dateStr: string, timeStr: string): string {
  const iso = `${dateStr}T${timeStr}:00`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? dateStr : d.toISOString();
}

async function onSubmit(payload: AppointmentSchema) {
  const date = combineDateTime(payload.date, payload.time);
  const data = {
    client_id: payload.client_id,
    service_id: payload.service_id ?? null,
    date,
    duration_minutes: payload.duration_minutes,
    price: payload.price ?? null,
    notes: payload.notes ?? null,
  };
  try {
    if (props.mode === "edit" && props.appointment) {
      await updateAppointment({
        id: props.appointment.id,
        appointment: data,
      });
      toast.add({
        title: "Cita actualizada",
        description: "La cita se actualizó correctamente",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      await createAppointment(data);
      toast.add({
        title: "Cita creada",
        description: "La cita se creó correctamente",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
    open.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="mode === 'edit' ? 'Editar cita' : 'Nueva cita'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <AppointmentForm :appointment="appointment" @submit="onSubmit" />
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        type="submit"
        form="appointment-form"
        label="Guardar"
        color="primary"
        :loading="saving"
      />
    </template>
  </UModal>
</template>
