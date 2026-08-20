<script setup lang="ts">
type Trend = "up" | "down" | "neutral" | "none";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    trend: Trend;
    amountLabel: string;
    pctLabel?: string;
    prefix?: "" | "+" | "-";
    sublabel?: string;
  }>(),
  {
    loading: false,
    pctLabel: undefined,
    prefix: "",
    sublabel: "vs mes anterior",
  },
);

const iconName = computed(() => {
  switch (props.trend) {
    case "up":
      return "i-lucide-arrow-up";
    case "down":
      return "i-lucide-arrow-down";
    default:
      return "i-lucide-minus";
  }
});

const textColorClass = computed(() => {
  switch (props.trend) {
    case "up":
      return "text-success";
    case "down":
      return "text-error";
    case "neutral":
      return "text-muted";
    default:
      return "text-dimmed";
  }
});

const badgeBgClass = computed(() => {
  switch (props.trend) {
    case "up":
      return "bg-success/10";
    case "down":
      return "bg-error/10";
    default:
      return "bg-muted";
  }
});

const showData = computed(() => props.trend !== "none");
</script>

<template>
  <USkeleton v-if="loading" class="h-4 w-32" />
  <template v-else-if="!showData">
    <div class="flex items-center gap-1.5">
      <UIcon name="i-lucide-minus" class="size-3.5 text-dimmed shrink-0" />
      <p class="text-xs text-dimmed">Sin datos del mes anterior</p>
    </div>
  </template>
  <div v-else class="flex items-center gap-1.5 min-w-0">
    <div
      class="flex items-center justify-center size-4 rounded-full shrink-0"
      :class="badgeBgClass"
    >
      <UIcon :name="iconName" class="size-3" :class="textColorClass" />
    </div>
    <p class="text-xs font-medium truncate" :class="textColorClass">
      {{ prefix }}{{ amountLabel }}<template v-if="pctLabel"> ({{ pctLabel }})</template>
    </p>
    <span v-if="sublabel" class="text-xs text-dimmed shrink-0">{{ sublabel }}</span>
  </div>
</template>