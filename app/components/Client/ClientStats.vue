<script setup lang="ts">
import type { ClientStats } from "../../composables/Client/queries/useClientStats";

const props = defineProps<{
  stats?: ClientStats | null;
  loading?: boolean;
}>();

const { formatDate, formatTime } = useDateUtils();
const { formatCurrency } = MoneyUtils();

const lastVisitLabel = computed(() => {
  if (!props.stats?.lastVisit) return "—";
  return formatDate(props.stats.lastVisit, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const nextAppointmentLabel = computed(() => {
  if (!props.stats?.nextAppointment) return "—";
  return formatDate(props.stats.nextAppointment, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const nextAppointmentTime = computed(() => {
  if (!props.stats?.nextAppointment) return null;
  return formatTime(props.stats.nextAppointment, {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
    <HomeStatCard
      icon="i-lucide-calendar-check"
      icon-bg-class="bg-primary/10"
      icon-color-class="text-primary"
      label="Citas totales"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-14 mt-1" />
        <template v-else>
          <p class="text-2xl font-bold text-highlighted">
            {{ stats?.total ?? 0 }}
          </p>
          <p class="text-xs text-muted mt-0.5">
            {{ stats?.completed ?? 0 }} completadas
          </p>
        </template>
      </template>
    </HomeStatCard>

    <HomeStatCard
      icon="i-lucide-wallet"
      icon-bg-class="bg-success/10"
      icon-color-class="text-success"
      label="Gasto acumulado"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-24 mt-1" />
        <p v-else class="text-2xl font-bold text-highlighted">
          {{ formatCurrency(stats?.revenue ?? 0) }}
        </p>
      </template>
    </HomeStatCard>

    <HomeStatCard
      icon="i-lucide-history"
      icon-bg-class="bg-muted"
      icon-color-class="text-dimmed"
      label="Última visita"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-28 mt-1" />
        <p v-else class="text-lg font-semibold text-highlighted mt-0.5">
          {{ lastVisitLabel }}
        </p>
      </template>
    </HomeStatCard>

    <HomeStatCard
      icon="i-lucide-calendar-clock"
      icon-bg-class="bg-info/10"
      icon-color-class="text-info"
      label="Próxima cita"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-28 mt-1" />
        <template v-else>
          <p class="text-lg font-semibold text-highlighted mt-0.5">
            {{ nextAppointmentLabel }}
          </p>
          <p
            v-if="nextAppointmentTime"
            class="text-xs text-muted mt-0.5 flex items-center gap-1"
          >
            <UIcon name="i-lucide-clock" class="size-3" />
            {{ nextAppointmentTime }}
          </p>
        </template>
      </template>
    </HomeStatCard>
  </div>
</template>
