<script setup lang="ts">
import type { AppointmentWithRelations } from "../../types/appointments";

definePageMeta({
  layout: "workspace",
  middleware: "auth",
});

const {
  data: paginated,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  statusFilter,
  refetch,
  fetchNextPage,
} = useInfiniteAppointments();

const appointmentsList = computed(() => {
  return paginated.value?.pages.flatMap((page) => page.data) ?? [];
});

const onStatusChange = (value: AppointmentStatusFilter) => {
  statusFilter.value = value;
};

const openFormModal = ref(false);
const mode = ref<"create" | "edit">("create");
const selectedAppointment = ref<AppointmentWithRelations | undefined>(
  undefined,
);

const onDetail = (appointment: AppointmentWithRelations) => {
  // TODO: open detail modal/drawer
  console.warn("[appointments] detail", appointment.id);
};
const onCreate = () => {
  openFormModal.value = true;
  mode.value = "create";
  selectedAppointment.value = undefined;
};
const onEdit = (appointment: AppointmentWithRelations) => {
  openFormModal.value = true;
  mode.value = "edit";
  selectedAppointment.value = appointment;
};
const onDelete = (appointment: AppointmentWithRelations) => {
  // TODO: open delete confirmation modal
  console.warn("[appointments] delete", appointment.id);
};
const onRestore = (appointment: AppointmentWithRelations) => {
  // TODO: open restore confirmation modal
  console.warn("[appointments] restore", appointment.id);
};
const onReagendar = (appointment: AppointmentWithRelations) => {
  // TODO: mark as reagendada (followed_up = true)
  console.warn("[appointments] reagendar", appointment.id);
};
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Citas"
      description="Consulta y administra tus citas"
      icon="i-lucide-calendar-check"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="link"
          color="neutral"
          :class="{ 'animate-spin': isFetching }"
          @click="refetch()"
        />
        <UButton
          icon="i-lucide-plus"
          color="primary"
          @click="onCreate"
          size="lg"
        />
      </template>
    </LayoutPageHeader>
    <AppointmentList
      v-model:status-filter="statusFilter"
      :appointments="appointmentsList"
      :loading="isFetching"
      :has-more="hasNextPage"
      :loading-more="isFetchingNextPage"
      :show-actions="true"
      @status-change="onStatusChange"
      @load-more="fetchNextPage"
      @detail="onDetail"
      @edit="onEdit"
      @delete="onDelete"
      @restore="onRestore"
      @reagendar="onReagendar"
    />
    <AppointmentModal
      v-model:open="openFormModal"
      :mode="mode"
      :appointment="selectedAppointment"
    />
  </div>
</template>
