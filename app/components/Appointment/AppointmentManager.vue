<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";

const props = defineProps<{
  appointments: AppointmentWithRelations[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  loadMore: [];
  statusChange: [value: AppointmentStatusFilter];
}>();

const statusFilter = defineModel<AppointmentStatusFilter>("statusFilter", {
  default: "ALL",
});

const { mutateAsync: updateAppointment } = useUpdateAppointment();
const toast = useToast();

const openFormModal = ref(false);
const openDeleteModal = ref(false);
const openUncancelModal = ref(false);
const openDetailDrawer = ref(false);
const openCompleteModal = ref(false);

const mode = ref<"create" | "edit">("create");
const selectedAppointment = ref<AppointmentWithRelations | undefined>(
  undefined,
);

const onCreate = () => {
  mode.value = "create";
  selectedAppointment.value = undefined;
  openFormModal.value = true;
};

const onEdit = (appointment: AppointmentWithRelations) => {
  mode.value = "edit";
  selectedAppointment.value = appointment;
  openFormModal.value = true;
};

const onDelete = (appointment: AppointmentWithRelations) => {
  selectedAppointment.value = appointment;
  openDeleteModal.value = true;
};

const onUncancel = (appointment: AppointmentWithRelations) => {
  selectedAppointment.value = appointment;
  openUncancelModal.value = true;
};

const onDetail = (appointment: AppointmentWithRelations) => {
  if (appointment.clients?.is_active === false) {
    toast.add({
      title: "Cliente inactivo",
      description:
        "No se puede ver el detalle de una cita con un cliente inactivo",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
    return;
  }
  selectedAppointment.value = appointment;
  openDetailDrawer.value = true;
};

const onReagendar = async (appointment: AppointmentWithRelations) => {
  try {
    await updateAppointment({
      id: appointment.id,
      appointment: { followed_up: true },
    });
    toast.add({
      title: "Cita marcada como reagendada",
      description: `${appointment.clients?.name ?? "La cita"} ya no aparecerá en Recordatorios`,
      color: "success",
      icon: "i-lucide-calendar-check",
    });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};

async function runStatusUpdate(
  appointment: AppointmentWithRelations,
  targetStatus: AppointmentWithRelations["status"],
  successMsg: string,
) {
  try {
    await updateAppointment({
      id: appointment.id,
      appointment: { status: targetStatus },
    });
    toast.add({
      title: "Estado actualizado",
      description: successMsg,
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

function onAdvance(appointment: AppointmentWithRelations) {
  if (appointment.status === "CONFIRMED") {
    selectedAppointment.value = appointment;
    openCompleteModal.value = true;
    return;
  }
  runStatusUpdate(appointment, "CONFIRMED", "Cita confirmada");
}

function onCancel(appointment: AppointmentWithRelations) {
  runStatusUpdate(appointment, "CANCELED", "Cita cancelada");
}

const onStatusChange = (value: AppointmentStatusFilter) => {
  emit("statusChange", value);
};

defineExpose({
  openCreate: onCreate,
});
</script>

<template>
  <div>
    <AppointmentList
      v-model:status-filter="statusFilter"
      :appointments="appointments"
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      :show-actions="showActions"
      @status-change="onStatusChange"
      @load-more="emit('loadMore')"
      @detail="onDetail"
      @edit="onEdit"
      @delete="onDelete"
      @restore="onUncancel"
      @reagendar="onReagendar"
    />

    <AppointmentModal
      v-model:open="openFormModal"
      :mode="mode"
      :appointment="selectedAppointment"
    />

    <AppointmentDeleteModal
      v-model:open="openDeleteModal"
      :appointment="selectedAppointment"
    />

    <AppointmentUncancelModal
      v-model:open="openUncancelModal"
      :appointment="selectedAppointment"
    />

    <AppointmentDetailDrawer
      v-model:open="openDetailDrawer"
      :appointment="selectedAppointment"
      @edit="onEdit"
      @delete="onDelete"
      @uncancel="onUncancel"
      @advance="onAdvance"
      @cancel="onCancel"
      @reagendar="onReagendar"
    />

    <AppointmentCompleteModal
      v-model:open="openCompleteModal"
      :appointment="selectedAppointment"
    />
  </div>
</template>
