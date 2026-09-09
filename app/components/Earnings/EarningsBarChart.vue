<script setup lang="ts">
import type { EarningsBucket } from "~/composables/Earnings/utils/revenueAggregation";

const props = withDefaults(
  defineProps<{
    buckets: EarningsBucket[];
    periodKey: string;
    loading?: boolean;
    emptyMessage?: string;
  }>(),
  {
    loading: false,
    emptyMessage: "Sin ganancias registradas en este periodo",
  },
);

const { formatCurrency, formatCurrencyCompact } = MoneyUtils();

const isEmpty = computed(
  () => !props.loading && props.buckets.every((bucket) => bucket.value <= 0),
);
const maxValue = computed(() =>
  props.buckets.reduce((max, bucket) => Math.max(max, bucket.value), 0),
);
const yAxis = computed(() => buildYAxis(maxValue.value));

const selectedIndex = ref<number | null>(null);

watch(
  () => props.periodKey,
  () => {
    selectedIndex.value = null;
  },
);

const selectedBucket = computed(() =>
  selectedIndex.value === null
    ? null
    : (props.buckets.find((bucket) => bucket.index === selectedIndex.value) ??
      null),
);

const toggleSelect = (bucket: EarningsBucket) => {
  selectedIndex.value =
    selectedIndex.value === bucket.index ? null : bucket.index;
};

const tickPosition = (tick: number) => ({
  top: `${100 - (tick / yAxis.value.top) * 100}%`,
});

const barHeight = (bucket: EarningsBucket) => {
  if (bucket.value <= 0 || yAxis.value.top <= 0) return "2px";
  const pct = Math.max((bucket.value / yAxis.value.top) * 100, 3);
  return `${pct}%`;
};

const barClass = (bucket: EarningsBucket) => {
  if (bucket.value <= 0) return "bg-muted";
  if (selectedIndex.value !== null) {
    return selectedIndex.value === bucket.index
      ? "bg-primary"
      : "bg-primary/40";
  }
  return bucket.isCurrent ? "bg-primary" : "bg-primary/70";
};

const bucketAriaLabel = (bucket: EarningsBucket) =>
  `${bucket.label}: ${formatCurrency(bucket.value)}, ${bucket.count} ${
    bucket.count === 1 ? "cita" : "citas"
  }`;
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-4 sm:p-5' }">
    <USkeleton v-if="loading" class="h-40 sm:h-48 w-full rounded-lg" />

    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center gap-3 py-10"
    >
      <div
        class="flex items-center justify-center size-14 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-piggy-bank" class="size-7 text-dimmed" />
      </div>
      <p class="text-muted text-sm">{{ emptyMessage }}</p>
    </div>

    <div v-else>
      <div class="flex items-center justify-between gap-3 min-h-8 mb-3">
        <template v-if="selectedBucket">
          <p class="text-sm font-semibold text-highlighted">
            {{ selectedBucket.label }}
          </p>
          <p class="text-sm text-muted">
            {{ selectedBucket.count }}
            {{ selectedBucket.count === 1 ? "cita" : "citas" }} ·
            <span class="font-semibold text-highlighted">
              {{ formatCurrency(selectedBucket.value) }}
            </span>
          </p>
        </template>
        <p v-else class="text-xs text-dimmed">
          Toca o pasa el cursor sobre una barra
        </p>
      </div>

      <div class="flex gap-2">
        <div
          class="relative w-10 sm:w-12 shrink-0 h-40 sm:h-48"
          aria-hidden="true"
        >
          <span
            v-for="tick in yAxis.ticks"
            :key="tick"
            class="absolute left-0 right-0 text-right text-[10px] text-dimmed tabular-nums -translate-y-1/2"
            :style="tickPosition(tick)"
          >
            {{ formatCurrencyCompact(tick) }}
          </span>
        </div>

        <div class="relative flex-1 min-w-0 overflow-x-auto">
          <div class="relative h-40 sm:h-48 min-w-max">
            <div
              v-for="tick in yAxis.ticks"
              :key="tick"
              class="absolute inset-x-0 border-t border-default"
              :class="tick === 0 ? 'border-solid' : 'border-dashed'"
              :style="tickPosition(tick)"
            />
            <div class="relative flex items-end gap-1 sm:gap-1.5 h-full">
              <UTooltip v-for="bucket in buckets" :key="bucket.index">
                <template #content>
                  <div class="space-y-0.5">
                    <p class="font-semibold">{{ bucket.label }}</p>
                    <p class="text-xs">
                      {{ formatCurrency(bucket.value) }}
                    </p>
                    <p class="text-xs">
                      {{ bucket.count }}
                      {{ bucket.count === 1 ? "cita" : "citas" }}
                    </p>
                  </div>
                </template>
                <div
                  role="button"
                  tabindex="0"
                  :aria-label="bucketAriaLabel(bucket)"
                  class="flex-1 min-w-3.5 sm:min-w-4 h-full flex flex-col justify-end cursor-pointer rounded-t-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  @click="toggleSelect(bucket)"
                  @keydown.enter.prevent="toggleSelect(bucket)"
                  @keydown.space.prevent="toggleSelect(bucket)"
                >
                  <div
                    class="w-full rounded-t-sm transition-all duration-200"
                    :class="barClass(bucket)"
                    :style="{ height: barHeight(bucket) }"
                  />
                </div>
              </UTooltip>
            </div>
          </div>
          <div class="flex gap-1 sm:gap-1.5 min-w-max mt-1.5">
            <span
              v-for="bucket in buckets"
              :key="bucket.index"
              class="flex-1 min-w-3.5 sm:min-w-4 text-center text-[10px] text-dimmed truncate"
              :class="bucket.isCurrent ? 'text-primary font-semibold' : ''"
            >
              {{ bucket.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
