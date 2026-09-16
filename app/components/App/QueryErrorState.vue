<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    compact?: boolean;
  }>(),
  {
    title: "No pudimos cargar esto",
    description: "Revisa tu conexión e inténtalo de nuevo.",
    compact: false,
  },
);

const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 text-center"
    :class="compact ? 'py-12' : 'py-20'"
  >
    <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
      <UIcon name="i-lucide-cloud-off" class="size-8 text-dimmed" />
    </div>
    <div class="space-y-1">
      <p class="text-sm font-medium text-highlighted">{{ title }}</p>
      <p class="text-muted text-sm">{{ description }}</p>
    </div>
    <UButton
      label="Reintentar"
      icon="i-lucide-refresh-cw"
      variant="outline"
      color="neutral"
      @click="emit('retry')"
    />
  </div>
</template>
