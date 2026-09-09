<script setup lang="ts">
import type {
  EarningsBucket,
  EarningsGranularity,
  EarningsRow,
} from "~/composables/Earnings/utils/revenueAggregation";

definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
});

const { formatDate, localDayKey } = DateUtils();

const now = new Date();

const granularity = ref<EarningsGranularity>("MONTH");
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);
const day = ref(now.getDate());

const { data: dataset, isFetching: loading } = useEarningsDataset();
const rows = computed<EarningsRow[]>(() => dataset.value ?? []);

const currentRange = computed(() =>
  getPeriodRange(granularity.value, {
    year: year.value,
    month: month.value,
    day: day.value,
  }),
);
const previousRange = computed(() =>
  getPeriodRange(
    granularity.value,
    getPreviousPeriod(granularity.value, {
      year: year.value,
      month: month.value,
      day: day.value,
    }),
  ),
);

const currentRows = computed(() => rowsInPeriod(rows.value, currentRange.value));
const previousRows = computed(() =>
  rowsInPeriod(rows.value, previousRange.value),
);

const summary = computed(() => summarizeRows(currentRows.value));
const previousTotal = computed(() => summarizeRows(previousRows.value).total);

const canNext = computed(() => {
  if (granularity.value === "YEAR") return year.value < now.getFullYear();
  if (granularity.value === "MONTH") {
    return (
      year.value < now.getFullYear() ||
      (year.value === now.getFullYear() &&
        month.value < now.getMonth() + 1)
    );
  }
  const current = new Date(year.value, month.value - 1, day.value);
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return current.getTime() < today.getTime();
});

function shift(direction: 1 | -1) {
  if (direction === 1 && !canNext.value) return;
  if (granularity.value === "YEAR") {
    year.value += direction;
  } else if (granularity.value === "MONTH") {
    const date = new Date(year.value, month.value - 1 + direction, 1);
    year.value = date.getFullYear();
    month.value = date.getMonth() + 1;
  } else {
    const date = new Date(year.value, month.value - 1, day.value + direction);
    year.value = date.getFullYear();
    month.value = date.getMonth() + 1;
    day.value = date.getDate();
  }
}

const periodLabel = computed(() => {
  if (granularity.value === "YEAR") {
    return formatDate(new Date(year.value, 0, 1), { year: "numeric" });
  }
  if (granularity.value === "MONTH") {
    return formatDate(new Date(year.value, month.value - 1, 1), {
      month: "long",
      year: "numeric",
    });
  }
  return formatDate(new Date(year.value, month.value - 1, day.value), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const comparisonLabel = computed(() => {
  if (granularity.value === "YEAR") return "vs año anterior";
  if (granularity.value === "MONTH") return "vs mes anterior";
  return "vs día anterior";
});

const noneLabel = computed(() => {
  if (granularity.value === "YEAR") return "Sin datos del año anterior";
  if (granularity.value === "MONTH") return "Sin datos del mes anterior";
  return "Sin datos del día anterior";
});

const periodKey = computed(() => {
  if (granularity.value === "YEAR") return String(year.value);
  if (granularity.value === "MONTH") return `${year.value}-${month.value}`;
  return `${year.value}-${month.value}-${day.value}`;
});

const chartBuckets = computed<EarningsBucket[]>(() => {
  if (granularity.value === "YEAR") {
    return buildMonthlyBuckets(rows.value, year.value).map((bucket) => ({
      ...bucket,
      label: formatDate(new Date(year.value, bucket.index - 1, 1), {
        month: "short",
      }),
    }));
  }
  if (granularity.value === "MONTH") {
    return buildDailyBuckets(rows.value, year.value, month.value);
  }
  return [];
});

const highlight = computed<
  { title: string; label?: string; value: number } | null
>(() => {
  if (granularity.value === "YEAR") {
    const best = bestMonthInYear(rows.value, year.value);
    return best
      ? {
          title: "Mejor mes",
          label: formatDate(new Date(year.value, best.index - 1, 1), {
            month: "long",
          }),
          value: best.value,
        }
      : null;
  }
  if (granularity.value === "MONTH") {
    const best = bestDayInMonth(rows.value, year.value, month.value);
    return best
      ? {
          title: "Mejor día",
          label: formatDate(new Date(year.value, month.value - 1, best.index), {
            day: "numeric",
            month: "short",
          }),
          value: best.value,
        }
      : null;
  }
  const prices = currentRows.value.map((row) => row.price ?? 0);
  const max = prices.length > 0 ? Math.max(...prices) : 0;
  return max > 0 ? { title: "Cita más alta", value: max } : null;
});

const selectedDayKey = ref<string | null>(localDayKey(now));

watch(
  [granularity, year, month, day],
  ([g, y, m, d]) => {
    selectedDayKey.value =
      g === "DAY"
        ? `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        : null;
  },
  { immediate: true },
);

const { data: dayAppointments, isFetching: dayLoading } =
  useAppointmentsByDay(selectedDayKey);

const completedDayAppointments = computed(() =>
  (dayAppointments.value ?? []).filter(
    (appointment) => appointment.status === "COMPLETED",
  ),
);
</script>

<template>
  <div class="space-y-4">
    <LayoutPageHeader
      title="Ganancias"
      description="Ganancias de tus citas completadas"
      icon="i-lucide-wallet"
    />

    <EarningsPeriodSwitcher
      v-model:granularity="granularity"
      :label="periodLabel"
      :can-next="canNext"
      @prev="shift(-1)"
      @next="shift(1)"
    />

    <EarningsSummaryCards
      :loading="loading"
      :total="summary.total"
      :previous-total="previousTotal"
      :count="summary.count"
      :avg="summary.avg"
      :comparison-label="comparisonLabel"
      :none-label="noneLabel"
      :highlight="highlight"
    />

    <EarningsDayList
      v-if="granularity === 'DAY'"
      :appointments="completedDayAppointments"
      :loading="dayLoading"
    />
    <EarningsBarChart
      v-else
      :buckets="chartBuckets"
      :period-key="periodKey"
      :loading="loading"
    />
  </div>
</template>
