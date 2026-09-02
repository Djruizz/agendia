<script setup lang="ts">
defineProps<{
  services: Service[];
  loading?: boolean;
}>();
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-lg font-semibold text-highlighted">Servicios</h2>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <USkeleton v-for="i in 4" :key="i" class="h-24 w-full" />
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      <PublicServiceCard
        v-for="service in services"
        :key="service.id"
        :service="service"
      />
    </div>
  </div>
</template>
