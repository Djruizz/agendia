<script setup lang="ts">
const props = defineProps<{
  services: Service[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  edit: [service: Service];
  delete: [service: Service];
}>();
</script>

<template>
  <div v-if="loading" class="grid gap-4">
    <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
  </div>

  <div
    v-else-if="services.length === 0"
    class="flex flex-col items-center justify-center gap-3 py-20"
  >
    <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
      <UIcon name="i-lucide-scissors" class="size-8 text-dimmed" />
    </div>
    <p class="text-muted text-sm">Aún no tienes servicios registrados</p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
    <ServiceCard
      v-for="service in services"
      :key="service.id"
      :service="service"
      show-actions
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
