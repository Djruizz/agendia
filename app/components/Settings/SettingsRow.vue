<script setup lang="ts">
defineProps<{
  label: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <div class="min-w-0">
      <p class="text-sm font-medium text-highlighted">{{ label }}</p>
      <p v-if="description" class="text-xs text-muted">{{ description }}</p>
    </div>
    <div class="shrink-0">
      <slot />
    </div>
  </div>
</template>
