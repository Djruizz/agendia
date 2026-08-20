<script setup lang="ts">
defineProps<{
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  label: string;
  loading?: boolean;
}>();
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-4' }">
    <div class="flex items-start gap-3">
      <div
        class="flex items-center justify-center size-11 rounded-xl shrink-0"
        :class="[iconBgClass, iconColorClass]"
      >
        <UIcon :name="icon" class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs text-muted truncate">{{ label }}</p>
        <slot name="value" :loading="loading">
          <USkeleton v-if="loading" class="h-7 w-20 mt-1" />
        </slot>
        <div v-if="$slots.footer" class="mt-1.5 min-h-5">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </UCard>
</template>