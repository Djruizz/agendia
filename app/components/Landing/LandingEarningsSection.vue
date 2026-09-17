<script setup lang="ts">
const stats = [
  {
    icon: "i-lucide-circle-dollar-sign",
    label: "Ingresos del mes",
    value: "$12,400",
    trend: "+18% vs mes anterior",
    trendIcon: "i-lucide-trending-up",
  },
  {
    icon: "i-lucide-calendar-check",
    label: "Citas del mes",
    value: "38",
    trend: "+5 vs mes anterior",
    trendIcon: "i-lucide-trending-up",
  },
  {
    icon: "i-lucide-users",
    label: "Clientes activos",
    value: "21",
    trend: "3 nuevos este mes",
    trendIcon: "i-lucide-user-plus",
  },
];
</script>

<template>
  <UPageSection
    id="ganancias"
    class="scroll-mt-24"
    headline="Ganancias"
    title="Sabe cuánto ganaste, sin hojas de cálculo"
    description="Cada cita completada registra su precio. Consulta tus ingresos por día, mes o año y compáralos con tus períodos anteriores."
    orientation="horizontal"
    reverse
  >
    <LandingReveal>
      <div class="space-y-3 text-left">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-lg bg-elevated/50 ring ring-default p-4 flex items-center gap-4"
        >
          <div
            class="flex items-center justify-center size-11 rounded-xl bg-primary/10 text-primary shrink-0"
          >
            <UIcon :name="stat.icon" class="size-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs text-muted">{{ stat.label }}</p>
            <p class="text-xl font-bold text-highlighted">{{ stat.value }}</p>
          </div>
          <UBadge
            color="success"
            variant="subtle"
            size="sm"
            :icon="stat.trendIcon"
            :label="stat.trend"
            class="shrink-0"
          />
        </div>
      </div>
    </LandingReveal>
  </UPageSection>
</template>
