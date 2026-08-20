<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";

const { localDayKey } = DateUtils();
const { data: upcoming, isFetching } = useUpcomingAppointments();

function onAppointmentClick(appointment: AppointmentWithRelations) {
  const dateKey = localDayKey(new Date(appointment.date));
  navigateTo({ path: "/workspace/calendar", query: { date: dateKey } });
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-highlighted">Próximas citas</h2>
      <UButton
        to="/workspace/calendar"
        variant="link"
        color="primary"
        size="sm"
        label="Ver calendario"
        icon="i-lucide-arrow-right"
        trailing-icon
      />
    </div>

    <div v-if="isFetching" class="grid gap-3">
      <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
    </div>

    <div
      v-else-if="!upcoming || upcoming.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-12 rounded-xl bg-elevated/30"
    >
      <div
        class="flex items-center justify-center size-14 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-calendar-x" class="size-7 text-dimmed" />
      </div>
      <p class="text-muted text-sm">No hay citas próximas</p>
    </div>

    <div v-else class="grid gap-3">
      <AppointmentCard
        v-for="appointment in upcoming"
        :key="appointment.id"
        :appointment="appointment"
        @detail="onAppointmentClick"
      />
    </div>
  </section>
</template>
