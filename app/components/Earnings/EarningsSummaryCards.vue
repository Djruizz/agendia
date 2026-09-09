<script setup lang="ts">
type Highlight = {
  title: string;
  label?: string;
  value: number;
};

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    total: number;
    previousTotal: number;
    count: number;
    avg: number;
    comparisonLabel?: string;
    noneLabel?: string;
    highlight?: Highlight | null;
  }>(),
  {
    loading: false,
    comparisonLabel: "vs periodo anterior",
    noneLabel: "Sin datos del periodo anterior",
    highlight: null,
  },
);

const { formatCurrency } = MoneyUtils();

const delta = computed(() => props.total - props.previousTotal);
const hasPrevious = computed(() => props.previousTotal > 0);
const pct = computed<number | null>(() => {
  if (props.previousTotal <= 0) return null;
  return Math.round((props.total / props.previousTotal - 1) * 100);
});
const trend = computed<"up" | "down" | "neutral" | "none">(() => {
  if (!hasPrevious.value) return "none";
  if (delta.value > 0) return "up";
  if (delta.value < 0) return "down";
  return "neutral";
});
const prefix = computed<"" | "+" | "-" | undefined>(() => {
  if (trend.value === "up") return "+";
  if (trend.value === "down") return "-";
  if (trend.value === "neutral") return "";
  return undefined;
});
const amountLabel = computed(() => formatCurrency(Math.abs(delta.value)));
const pctLabel = computed(() =>
  pct.value === null ? undefined : `${pct.value}%`,
);
const showHighlight = computed(
  () => props.highlight !== null && props.highlight.value > 0,
);
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
    <HomeStatCard
      icon="i-lucide-wallet"
      icon-bg-class="bg-success/10"
      icon-color-class="text-success"
      label="Total del periodo"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-24 mt-1" />
        <p v-else class="text-2xl font-bold text-highlighted">
          {{ formatCurrency(total) }}
        </p>
      </template>
      <template #footer>
        <HomeRevenueComparisonIndicator
          :loading="loading"
          :trend="trend"
          :amount-label="amountLabel"
          :pct-label="pctLabel"
          :prefix="prefix"
          :sublabel="comparisonLabel"
          :none-label="noneLabel"
        />
      </template>
    </HomeStatCard>

    <HomeStatCard
      icon="i-lucide-coins"
      icon-bg-class="bg-primary/10"
      icon-color-class="text-primary"
      label="Promedio por cita"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-20 mt-1" />
        <p v-else class="text-2xl font-bold text-highlighted">
          {{ formatCurrency(avg) }}
        </p>
      </template>
    </HomeStatCard>

    <HomeStatCard
      icon="i-lucide-calendar-check"
      icon-bg-class="bg-info/10"
      icon-color-class="text-info"
      label="Citas completadas"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-12 mt-1" />
        <p v-else class="text-2xl font-bold text-highlighted">{{ count }}</p>
      </template>
    </HomeStatCard>

    <HomeStatCard
      v-if="showHighlight && highlight"
      icon="i-lucide-trophy"
      icon-bg-class="bg-warning/10"
      icon-color-class="text-warning"
      :label="highlight.title"
      :loading="loading"
    >
      <template #value>
        <USkeleton v-if="loading" class="h-7 w-24 mt-1" />
        <p v-else class="text-2xl font-bold text-highlighted">
          {{ formatCurrency(highlight.value) }}
        </p>
      </template>
      <template v-if="highlight.label" #footer>
        <p class="text-xs text-dimmed truncate">{{ highlight.label }}</p>
      </template>
    </HomeStatCard>
  </div>
</template>
