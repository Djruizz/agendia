<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);

const { data: monthCount, isFetching: monthCountLoading } =
  useMonthAppointmentCount(year, month);
const { data: totalClients, isFetching: clientsLoading } = useTotalClients();

const monthLabel = computed(() =>
  new Intl.DateTimeFormat("es-AR", {
    month: "long",
  }).format(new Date(year.value, month.value - 1, 1)),
);
</script>

<template>
  <div class="space-y-4">
    <LayoutPageHeader
      title="Inicio"
      description="Resumen general de tu negocio"
      icon="i-lucide-home"
    />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <HomeRevenueCard
        :year="year"
        :month="month"
        :label="`Ganancias en ${monthLabel}`"
      />
      <HomeStatCard
        icon="i-lucide-calendar-check"
        icon-bg-class="bg-primary/10"
        icon-color-class="text-primary"
        :label="`Citas en ${monthLabel}`"
        :loading="monthCountLoading"
        @click="navigateTo('/workspace/calendar')"
      >
        <template #value>
          <USkeleton v-if="monthCountLoading" class="h-7 w-16" />
          <p v-else class="text-2xl font-bold text-highlighted">
            {{ monthCount ?? 0 }}
          </p>
        </template>
      </HomeStatCard>

      <HomeStatCard
        icon="i-lucide-users"
        icon-bg-class="bg-info/10"
        icon-color-class="text-info"
        label="Clientes totales"
        :loading="clientsLoading"
        @click="navigateTo('/workspace/clients')"
      >
        <template #value>
          <USkeleton v-if="clientsLoading" class="h-7 w-12" />
          <p v-else class="text-2xl font-bold text-highlighted">
            {{ totalClients ?? 0 }}
          </p>
        </template>
      </HomeStatCard>
    </div>

    <HomeUpcomingAppointmentsSection />
  </div>
</template>
