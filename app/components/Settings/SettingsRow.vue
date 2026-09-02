<script setup lang="ts">
defineProps<{
  label: string;
  description?: string;
  wrap?: boolean;
}>();
</script>

<template>
  <div
    :class="
      wrap
        ? 'flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'
        : 'flex items-center justify-between gap-3'
    "
  >
    <div class="min-w-0">
      <p class="text-sm font-semibold text-highlighted">{{ label }}</p>
      <p v-if="description" class="text-xs text-muted">{{ description }}</p>
    </div>
    <div :class="wrap ? 'w-full sm:w-auto shrink-0' : 'shrink-0'">
      <slot />
    </div>
  </div>
</template>
