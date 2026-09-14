<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  updatedAt: string;
}>();
</script>

<template>
  <UContainer class="py-12 max-w-3xl">
    <div class="mb-10 space-y-3">
      <UBadge
        color="neutral"
        variant="subtle"
        icon="i-lucide-scale"
        label="Documento legal"
      />
      <h1 class="text-3xl sm:text-4xl font-bold text-default">
        {{ title }}
      </h1>
      <p v-if="description" class="text-lg text-muted">
        {{ description }}
      </p>
      <p class="text-sm text-muted">Última actualización: {{ updatedAt }}</p>
    </div>

    <div class="space-y-8 text-muted leading-relaxed">
      <slot />
    </div>
  </UContainer>
</template>
