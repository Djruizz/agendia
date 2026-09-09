<script setup lang="ts">
import type { EarningsGranularity } from "~/composables/Earnings/utils/revenueAggregation";

defineProps<{
  label: string;
  canNext: boolean;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
}>();

const granularity = defineModel<EarningsGranularity>("granularity", {
  default: "MONTH",
});

const options: { label: string; value: EarningsGranularity }[] = [
  { label: "Día", value: "DAY" },
  { label: "Mes", value: "MONTH" },
  { label: "Año", value: "YEAR" },
];
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-3 sm:p-4' }">
    <div class="flex flex-col-reverse sm:flex-row items-center gap-3">
      <URadioGroup
        v-model="granularity"
        :items="options"
        orientation="horizontal"
        variant="table"
        size="sm"
        indicator="hidden"
      />

      <div
        class="flex items-center justify-center gap-1 w-full sm:w-auto sm:ms-auto"
      >
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          aria-label="Periodo anterior"
          class="cursor-pointer"
          @click="emit('prev')"
        />
        <span
          class="min-w-36 sm:min-w-44 text-center text-sm font-semibold text-highlighted capitalize"
        >
          {{ label }}
        </span>
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          aria-label="Periodo siguiente"
          class="cursor-pointer"
          :disabled="!canNext"
          @click="emit('next')"
        />
      </div>
    </div>
  </UCard>
</template>
