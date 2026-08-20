<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title: string;
    description?: string;
  }>(),
  {
    icon: undefined,
    description: undefined,
  },
);
</script>

<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex items-center gap-2 min-w-0">
        <UIcon v-if="icon" :name="icon" class="size-5 text-primary shrink-0" />
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-highlighted">{{ title }}</h2>
          <p v-if="description" class="text-xs text-muted">
            {{ description }}
          </p>
        </div>
      </div>
    </template>
    <slot />
  </UCard>
</template>
