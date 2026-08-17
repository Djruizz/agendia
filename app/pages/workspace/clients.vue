<script setup lang="ts">
import { type Client } from "../../types/clients";
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});
const {
  data: paginated,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  searchTerm,
  sortOrder,
  refetch,
  fetchNextPage,
} = useInfiniteClients();
const clientsList = computed(() => {
  return paginated.value?.pages.flatMap((page) => page.data) ?? [];
});

const onSearch = (value: string) => {
  searchTerm.value = value;
};
const onSort = (value: "asc" | "desc") => {
  sortOrder.value = value;
};

const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const selectedClient = ref<Client | undefined>(undefined);

const onEdit = (client: Client) => {
  selectedClient.value = client;
  editModalOpen.value = true;
};
const onDelete = (client: Client) => {
  selectedClient.value = client;
  deleteModalOpen.value = true;
};
const onCreate = () => {
  selectedClient.value = undefined;
  editModalOpen.value = true;
};
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Clientes"
      description="Gestiona tu cartera de clientes"
      icon="i-lucide-users"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="link"
          color="neutral"
          :class="{ 'animate-spin': isFetching }"
          @click="refetch()"
        />
        <UButton icon="i-lucide-user-plus" size="lg" @click="onCreate" />
      </template>
    </LayoutPageHeader>
    <ClientList
      :clients="clientsList"
      :loading="isFetching"
      :has-more="hasNextPage"
      :loading-more="isFetchingNextPage"
      @search="onSearch"
      @sort="onSort"
      @edit="onEdit"
      @delete="onDelete"
      @loadMore="fetchNextPage"
    />

    <ClientModal
      v-model:open="editModalOpen"
      :mode="selectedClient ? 'edit' : 'create'"
      :client="selectedClient"
    />

    <ClientDeleteModal
      v-model:open="deleteModalOpen"
      :client="selectedClient"
    />
  </div>
</template>
