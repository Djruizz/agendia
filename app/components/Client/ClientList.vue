<script setup lang="ts">
import type { Client } from "../../types/clients";
const props = defineProps<{
  clients: Client[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
}>();

const emit = defineEmits<{
  edit: [client: Client];
  delete: [client: Client];
  loadMore: [];
  search: [value: string];
  sort: [value: "asc" | "desc"];
}>();

const search = ref("");
const sort = ref<"asc" | "desc">("asc");

const sortItems = [
  { label: "A - Z", value: "asc" as const, icon: "i-lucide-arrow-down-a-z" },
  { label: "Z - A", value: "desc" as const, icon: "i-lucide-arrow-up-a-z" },
];

// Debounce casero para no machacar Supabase con cada tecla.
let searchTimer: ReturnType<typeof setTimeout> | undefined;
watch(search, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => emit("search", value), 350);
});

watch(sort, (value) => emit("sort", value));
</script>

<template>
  <template v-if="loading && clients.length === 0">
    <div class="grid gap-4">
      <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
    </div>
  </template>

  <template v-else>
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Buscar por nombre"
        class="flex-1"
      />
      <USelect
        v-model="sort"
        :items="sortItems"
        item-label="label"
        item-value="value"
        class="sm:w-44"
      />
    </div>

    <div
      v-if="clients.length === 0"
      class="flex flex-col items-center justify-center gap-3 py-20"
    >
      <div
        class="flex items-center justify-center size-16 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-search-x" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">No se encontraron clientes</p>
    </div>

    <div v-else class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
        <ClientCard
          v-for="client in clients"
          :key="client.id"
          :client="client"
          show-actions
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </div>

      <div v-if="hasMore" class="flex justify-center pt-2">
        <UButton
          label="Cargar más"
          icon="i-lucide-chevron-down"
          variant="outline"
          color="neutral"
          :loading="loadingMore"
          @click="emit('loadMore')"
        />
      </div>
    </div>
  </template>
</template>
