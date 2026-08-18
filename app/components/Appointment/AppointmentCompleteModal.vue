<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";

const props = defineProps<{
  appointment?: AppointmentWithRelations;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: updateAppointment, isPending: completing } =
  useUpdateAppointment();
const toast = useToast();

const price = ref<number | undefined>(props.appointment?.price ?? undefined);
const notes = ref<string>(props.appointment?.notes ?? "");

watch(
  () => props.appointment,
  (val) => {
    price.value = val?.price ?? undefined;
    notes.value = val?.notes ?? "";
  },
);

async function onConfirm() {
  if (!props.appointment) return;
  try {
    await updateAppointment({
      id: props.appointment.id,
      appointment: {
        status: "COMPLETED",
        price: price.value ?? null,
        notes: notes.value.trim() ? notes.value.trim() : null,
      },
    });
    toast.add({
      title: "Cita completada",
      description: `${props.appointment.clients?.name ?? "La cita"} se marcó como completada`,
      color: "success",
      icon: "i-lucide-check-check",
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
    title="Completar cita"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4 py-2">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center size-12 rounded-xl shrink-0 bg-success/10 text-success"
          >
            <UIcon name="i-lucide-check-check" class="size-6" />
          </div>
          <p class="text-sm text-muted">
            Confirma el precio cobrado y agrega notas sobre cómo se realizó la
            cita.
          </p>
        </div>

        <UFormField label="Precio (MXN)" name="price">
          <UInput
            v-model.number="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            icon="i-lucide-dollar-sign"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Notas" name="notes">
          <UTextarea
            v-model="notes"
            placeholder="Notas sobre la cita"
            :rows="3"
            autoresize
            :maxrows="5"
            class="w-full"
          />
        </UFormField>
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
        label="Marcar como completada"
        color="success"
        icon="i-lucide-check-check"
        :loading="completing"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>