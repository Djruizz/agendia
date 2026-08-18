<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";

const props = defineProps<{
  appointment?: AppointmentWithRelations;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: updateAppointment, isPending: updating } =
  useUpdateAppointment();
const toast = useToast();

async function onConfirm() {
  if (!props.appointment) return;
  try {
    await updateAppointment({
      id: props.appointment.id,
      appointment: { status: "PENDING" },
    });
    toast.add({
      title: "Cita reagendada",
      description: `${props.appointment.clients?.name ?? "La cita"} volvió a estado Pendiente`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
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
    title="Reagendar cita cancelada"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div
          class="flex items-center justify-center size-16 rounded-full bg-primary/10"
        >
          <UIcon name="i-lucide-calendar-check" class="size-8 text-primary" />
        </div>

        <div class="space-y-2">
          <p class="text-base font-semibold text-highlighted">
            ¿Quieres reagendar esta cita?
          </p>
          <p class="text-sm text-muted max-w-sm">
            Volverá al estado Pendiente para que puedas confirmar y ajustar la
            fecha nuevamente.
          </p>
        </div>

        <div v-if="appointment" class="w-full text-start">
          <AppointmentCard :appointment="appointment" />
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        label="Reagendar"
        color="primary"
        icon="i-lucide-calendar-check"
        :loading="updating"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>