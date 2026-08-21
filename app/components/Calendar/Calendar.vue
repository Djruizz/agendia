<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    year: number;
    month: number;
    counts: Map<string, number>;
    weekStart?: 0 | 1;
  }>(),
  {
    weekStart: 1,
  },
);

const emit = defineEmits<{
  prev: [];
  next: [];
}>();

const selectedDate = defineModel<string | null>("selectedDate", {
  default: null,
});

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const { localDayKey, formatDate } = DateUtils();

const monthLabel = computed(() =>
  formatDate(new Date(props.year, props.month - 1, 1), {
    month: "long",
    year: "numeric",
  }),
);

const firstWeekday = computed(() => {
  const day = new Date(props.year, props.month - 1, 1).getDay();
  return (day - props.weekStart + 7) % 7;
});

const daysInMonth = computed(() =>
  new Date(props.year, props.month, 0).getDate(),
);

const todayKey = computed(() => localDayKey(new Date()));

const cells = computed(() => {
  const total = firstWeekday.value + daysInMonth.value;
  const rows = Math.ceil(total / 7);
  const totalCells = rows * 7;
  const result: ({ key: string; day: number } | null)[] = [];

  for (let i = 0; i < firstWeekday.value; i++) {
    result.push(null);
  }

  for (let day = 1; day <= daysInMonth.value; day++) {
    result.push({
      key: `${props.year}-${String(props.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      day,
    });
  }

  while (result.length < totalCells) {
    result.push(null);
  }

  return result;
});

const onSelectDay = (key: string) => {
  selectedDate.value = key;
};
</script>

<template>
  <div class="rounded-xl border border-default p-4 bg-default max-w-lg">
    <div class="flex items-center justify-between mb-4">
      <UButton
        icon="i-lucide-chevron-left"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="emit('prev')"
      />
      <h3 class="text-base font-semibold capitalize">
        {{ monthLabel }}
      </h3>
      <UButton
        icon="i-lucide-chevron-right"
        variant="ghost"
        color="neutral"
        size="sm"
        @click="emit('next')"
      />
    </div>

    <div class="grid grid-cols-7 gap-1 mb-1">
      <div
        v-for="(label, idx) in WEEKDAY_LABELS"
        :key="idx"
        class="text-center text-xs font-medium text-muted py-1"
      >
        {{ label }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <template v-for="(cell, idx) in cells" :key="idx">
        <div v-if="!cell" class="aspect-square" />
        <UButton
          v-else
          :variant="cell.key === selectedDate ? 'subtle' : 'ghost'"
          :color="cell.key === selectedDate ? 'primary' : 'neutral'"
          class="aspect-square p-0 relative flex flex-col items-center justify-center"
          :class="[
            cell.key === todayKey && cell.key !== selectedDate
              ? 'ring-1 ring-primary'
              : '',
          ]"
          @click="onSelectDay(cell.key)"
        >
          <span class="text-sm">{{ cell.day }}</span>
          <UBadge
            v-if="counts.get(cell.key)"
            color="primary"
            size="sm"
            variant="subtle"
            class="absolute bottom-1 right-1 px-1 flex items-center justify-center"
          >
            {{ counts.get(cell.key) }}
          </UBadge>
        </UButton>
      </template>
    </div>
  </div>
</template>
