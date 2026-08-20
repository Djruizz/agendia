<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  icon?: string;
}>();
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          v-if="icon"
          class="flex items-center justify-center size-11 shrink-0 rounded-xl bg-primary/10 text-primary"
        >
          <UIcon :name="icon" class="size-5" />
        </div>
        <div class="min-w-0">
          <h1
            class="text-xl font-bold tracking-tight text-highlighted truncate"
          >
            {{ title }}
          </h1>
          <p v-if="description" class="text-sm text-muted mt-0.5 truncate">
            {{ description }}
          </p>
        </div>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
        <slot name="actions" />
      </div>
    </div>
    <USeparator orientation="horizontal" />
  </div>
</template>
