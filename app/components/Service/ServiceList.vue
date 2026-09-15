<script setup lang="ts">
const props = defineProps<{
  services: Service[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  edit: [service: Service];
  delete: [service: Service];
  restore: [service: Service];
  create: [];
}>();

const activeFilter = defineModel<"active" | "inactive">("activeFilter", {
  default: "active",
});

const filterItems = [
  { label: "Activos", value: "active" as const, icon: "i-lucide-check" },
  { label: "Inactivos", value: "inactive" as const, icon: "i-lucide-eye-off" },
];
</script>

<template>
  <div v-if="loading" class="grid gap-4">
    <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
  </div>

  <template v-else>
    <div class="flex justify-end mb-4">
      <USelect
        v-model="activeFilter"
        :items="filterItems"
        item-label="label"
        item-value="value"
        icon="i-lucide-filter"
        class="w-40"
      />
    </div>

    <div
      v-if="services.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-20"
    >
      <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
        <UIcon
          :name="activeFilter === 'inactive' ? 'i-lucide-eye-off' : 'i-lucide-scissors'"
          class="size-8 text-dimmed"
        />
      </div>
      <p class="text-muted text-sm">
        {{
          activeFilter === "inactive"
            ? "No tienes servicios inactivos"
            : "Aún no tienes servicios registrados"
        }}
      </p>
      <UButton
        v-if="activeFilter === 'active'"
        label="Crear mi primer servicio"
        icon="i-lucide-plus"
        @click="emit('create')"
      />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
      <ServiceCard
        v-for="service in services"
        :key="service.id"
        :service="service"
        show-actions
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @restore="emit('restore', $event)"
      />
    </div>
  </template>
</template>
