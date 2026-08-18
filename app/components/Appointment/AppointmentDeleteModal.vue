<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";

const props = defineProps<{
  appointment?: AppointmentWithRelations;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: deleteAppointment, isPending: deleting } =
  useDeleteAppointment();
const toast = useToast();

async function onConfirm() {
  if (!props.appointment) return;
  try {
    await deleteAppointment(props.appointment.id);
    toast.add({
      title: "Cita eliminada",
      description: `${props.appointment.clients?.name ?? "La cita"} fue eliminada`,
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
    title="Eliminar cita"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div
          class="flex items-center justify-center size-16 rounded-full bg-error/10"
        >
          <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
        </div>

        <div class="space-y-2">
          <p class="text-base font-semibold text-highlighted">
            ¿Estás seguro de eliminar esta cita?
          </p>
          <p class="text-sm text-muted max-w-sm">
            Esta acción eliminará la cita permanentemente. No se puede deshacer.
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
        label="Eliminar"
        color="error"
        icon="i-lucide-trash-2"
        :loading="deleting"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>