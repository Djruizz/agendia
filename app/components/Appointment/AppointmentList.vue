<script setup lang="ts">
import type { AppointmentWithRelations } from "../../types/appointments";
import type { AppointmentStatusFilter } from "../../composables/utils/useAppointmentStatus";

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
  detail: [appointment: AppointmentWithRelations];
  edit: [appointment: AppointmentWithRelations];
  delete: [appointment: AppointmentWithRelations];
  restore: [appointment: AppointmentWithRelations];
  reagendar: [appointment: AppointmentWithRelations];
}>();

const statusFilter = defineModel<AppointmentStatusFilter>("statusFilter", {
  default: "ALL",
});

const statusFilters: {
  label: string;
  value: AppointmentStatusFilter;
  icon: string;
  iconColor: string;
}[] = [
  {
    label: "Todas",
    value: "ALL",
    icon: "i-lucide-list",
    iconColor: "text-neutral-500",
  },
  {
    label: "Pendientes",
    value: "PENDING",
    icon: "i-lucide-clock",
    iconColor: "text-yellow-500",
  },
  {
    label: "Confirmadas",
    value: "CONFIRMED",
    icon: "i-lucide-check-circle",
    iconColor: "text-blue-500",
  },
  {
    label: "Completadas",
    value: "COMPLETED",
    icon: "i-lucide-check-check",
    iconColor: "text-green-500",
  },
  {
    label: "Reagendadas",
    value: "REAGENDADA",
    icon: "i-lucide-calendar-check",
    iconColor: "text-emerald-500",
  },
  {
    label: "Canceladas",
    value: "CANCELED",
    icon: "i-lucide-x-circle",
    iconColor: "text-red-500",
  },
  {
    label: "Recordar",
    value: "REMEMBER",
    icon: "i-lucide-bell-ring",
    iconColor: "text-primary",
  },
];

watch(statusFilter, (value) => emit("statusChange", value));
</script>

<template>
  <template v-if="loading && appointments.length === 0">
    <div class="grid gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
    </div>
  </template>

  <template v-else>
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <USelect
        v-model="statusFilter"
        :items="statusFilters"
        item-label="label"
        item-value="value"
        class="sm:w-56"
      >
        <template #item="{ item }">
          <div class="flex items-center gap-2">
            <UIcon :name="item.icon" class="size-4" :class="item.iconColor" />
            <span>{{ item.label }}</span>
          </div>
        </template>
      </USelect>
    </div>

    <div
      v-if="appointments.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-20"
    >
      <div
        class="flex items-center justify-center size-16 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-calendar-x" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">No se encontraron citas</p>
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AppointmentCard
          v-for="appointment in appointments"
          :key="appointment.id"
          :appointment="appointment"
          :show-actions="showActions"
          @detail="emit('detail', $event)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @restore="emit('restore', $event)"
          @reagendar="emit('reagendar', $event)"
        />
      </div>

      <div v-if="hasMore" class="flex justify-center pt-2">
        <UButton
          label="Cargar más"
          icon="i-lucide-chevron-down"
          variant="outline"
          color="neutral"
          :loading="loadingMore"
          @click="emit('loadMore')"
        />
      </div>
    </div>
  </template>
</template>
