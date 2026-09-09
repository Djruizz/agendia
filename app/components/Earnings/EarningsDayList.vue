<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";

defineProps<{
  appointments: AppointmentWithRelations[];
  loading?: boolean;
}>();

const { formatTime } = useDateUtils();
const { formatCurrency } = MoneyUtils();
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-0' }">
    <div class="px-4 py-3 sm:px-5 border-b border-default">
      <h2 class="text-sm font-semibold text-highlighted">
        Citas completadas del día
      </h2>
    </div>

    <div v-if="loading" class="p-4 sm:p-5 space-y-3">
      <USkeleton v-for="i in 3" :key="i" class="h-12 rounded-lg" />
    </div>

    <div
      v-else-if="appointments.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-10"
    >
      <div
        class="flex items-center justify-center size-14 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-calendar-check" class="size-7 text-dimmed" />
      </div>
      <p class="text-muted text-sm">Sin citas completadas este día</p>
    </div>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="appointment in appointments"
        :key="appointment.id"
        class="flex items-center gap-3 px-4 py-3 sm:px-5"
      >
        <div
          class="flex flex-col items-center justify-center w-14 shrink-0 rounded-lg bg-muted py-1.5"
        >
          <UIcon name="i-lucide-clock" class="size-3.5 text-dimmed" />
          <span class="mt-0.5 text-xs font-medium text-default">
            {{ formatTime(appointment.date) }}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-highlighted truncate">
            {{ appointment.clients?.name || "Sin cliente" }}
          </p>
          <p class="text-xs text-muted truncate">
            {{ appointment.services?.name || "Sin servicio" }}
          </p>
        </div>
        <p
          class="shrink-0 text-sm font-semibold"
          :class="appointment.price != null ? 'text-highlighted' : 'text-dimmed'"
        >
          {{
            appointment.price != null ? formatCurrency(appointment.price) : "—"
          }}
        </p>
      </li>
    </ul>
  </UCard>
</template>
