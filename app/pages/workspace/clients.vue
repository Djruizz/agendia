<script setup lang="ts">
import { type Client } from "../../types/clients";
definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
});
const {
  data: paginated,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  isError,
  searchTerm,
  sortOrder,
  activeFilter,
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

const { mutateAsync: updateClient, isPending: restoring } = useUpdateClient();
const toast = useToast();

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
const onRestore = async (client: Client) => {
  try {
    await updateClient({ id: client.id, client: { is_active: true } });
    toast.add({
      title: "Cliente reactivado",
      description: `${client.name} volvió a la lista de activos`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: describeMutationError(err),
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
};
</script>

<template>
  <div class="space-y-4">
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
          aria-label="Actualizar"
          :class="{ 'animate-spin': isFetching }"
          @click="refetch()"
        />
        <UButton
          icon="i-lucide-user-plus"
          size="lg"
          aria-label="Nuevo cliente"
          :disabled="restoring"
          @click="onCreate"
        />
      </template>
    </LayoutPageHeader>
    <AppQueryErrorState
      v-if="isError"
      title="No pudimos cargar tus clientes"
      @retry="refetch()"
    />
    <ClientList
      v-else
      v-model:active-filter="activeFilter"
      :clients="clientsList"
      :loading="isFetching"
      :has-more="hasNextPage"
      :loading-more="isFetchingNextPage"
      @search="onSearch"
      @sort="onSort"
      @edit="onEdit"
      @delete="onDelete"
      @restore="onRestore"
      @loadMore="fetchNextPage"
      @create="onCreate"
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
