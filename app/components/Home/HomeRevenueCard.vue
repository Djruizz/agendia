<script setup lang="ts">
const props = defineProps<{
  year: number;
  month: number;
  label: string;
}>();

const yearRef = computed(() => props.year);
const monthRef = computed(() => props.month);

const prevYear = computed(() =>
  props.month === 1 ? props.year - 1 : props.year,
);
const prevMonth = computed(() => (props.month === 1 ? 12 : props.month - 1));

const { data: current, isFetching: currentLoading } = useMonthRevenue(
  yearRef,
  monthRef,
);
const { data: previous, isFetching: previousLoading } = useMonthRevenue(
  prevYear,
  prevMonth,
);

const { formatCurrency } = MoneyUtils();

const formattedAmount = computed(() => formatCurrency(current.value));

const delta = computed(() => (current.value ?? 0) - (previous.value ?? 0));
const hasPrevious = computed(() => (previous.value ?? 0) > 0);
const pct = computed<number | null>(() => {
  const prev = previous.value ?? 0;
  if (prev <= 0) return null;
  return Math.round(((current.value ?? 0) / prev - 1) * 100);
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

const comparisonLoading = computed(
  () => currentLoading.value || previousLoading.value,
);
</script>

<template>
<HomeStatCard
    icon="i-lucide-dollar-sign"
    icon-bg-class="bg-success/10"
    icon-color-class="text-success"
    :label="label"
    :loading="currentLoading"
  >
    <template #value>
      <USkeleton v-if="currentLoading" class="h-7 w-24" />
      <p v-else class="text-2xl font-bold text-highlighted">
        {{ formattedAmount }}
      </p>
    </template>
    <template #footer>
      <HomeRevenueComparisonIndicator
        :loading="comparisonLoading"
        :trend="trend"
        :amount-label="amountLabel"
        :pct-label="pctLabel"
        :prefix="prefix"
      />
    </template>
  </HomeStatCard>
</template>
