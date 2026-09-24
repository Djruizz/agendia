<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
  key: (route) => route.fullPath,
});

const route = useRoute();
const clientId = route.params.id as string;

const {
  data: clientData,
  isLoading,
  isError,
  refetch,
} = useClient(() => clientId);

const client = computed(() => clientData.value ?? undefined);

const {
  data: paginated,
  hasNextPage,
  isFetchingNextPage,
  isFetching: isFetchingAppointments,
  statusFilter,
  refetch: refetchAppointments,
  fetchNextPage,
} = useInfiniteAppointments({ clientId });

const appointmentsList = computed(() => {
  return paginated.value?.pages.flatMap((page) => page.data) ?? [];
});

const onStatusChange = (value: AppointmentStatusFilter) => {
  statusFilter.value = value;
};

const managerRef = useTemplateRef<{ openCreate: () => void }>("managerRef");

const onCreateAppointment = () => {
  managerRef.value?.openCreate();
};

const { mutateAsync: updateClient, isPending: restoring } = useUpdateClient();
const toast = useToast();

const editModalOpen = ref(false);
const deleteModalOpen = ref(false);

const onEdit = () => {
  editModalOpen.value = true;
};

const onDelete = () => {
  deleteModalOpen.value = true;
};

const onDeleted = () => {
  navigateTo("/workspace/clients");
};

const onRestore = async () => {
  if (!client.value) return;
  const target = client.value;
  try {
    await updateClient({ id: target.id, client: { is_active: true } });
    toast.add({
      title: "Cliente reactivado",
      description: `${target.name} volvió a la lista de activos`,
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
    <UButton
      icon="i-lucide-arrow-left"
      label="Clientes"
      variant="link"
      color="neutral"
      to="/workspace/clients"
      class="px-0"
    />

    <LayoutPageHeader
      title="Cliente"
      description="Detalle e historial de citas"
      icon="i-lucide-user"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="link"
          color="neutral"
          aria-label="Actualizar"
          :class="{ 'animate-spin': isLoading || isFetchingAppointments }"
          @click="
            refetch();
            refetchAppointments();
          "
        />
        <UButton
          icon="i-lucide-calendar-plus"
          color="primary"
          size="lg"
          aria-label="Nueva cita"
          @click="onCreateAppointment"
        />
      </template>
    </LayoutPageHeader>

    <AppQueryErrorState
      v-if="isError"
      title="No pudimos cargar este cliente"
      @retry="refetch()"
    />

    <template v-else-if="isLoading && !client">
      <USkeleton class="h-40 rounded-xl" />
      <USkeleton class="h-24 rounded-xl" />
    </template>

    <div
      v-else-if="!client"
      class="flex flex-col items-center justify-center gap-3 py-20"
    >
      <div
        class="flex items-center justify-center size-16 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-user-x" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">Cliente no encontrado</p>
      <UButton
        label="Volver a clientes"
        icon="i-lucide-arrow-left"
        to="/workspace/clients"
      />
    </div>

    <template v-else>
      <ClientProfileCard
        :client="client"
        :class="{ 'pointer-events-none opacity-60': restoring }"
        @edit="onEdit"
        @delete="onDelete"
        @restore="onRestore"
      />

      <section class="space-y-4">
        <h2 class="text-base font-semibold text-highlighted">
          Historial de citas
        </h2>
        <AppointmentManager
          ref="managerRef"
          v-model:status-filter="statusFilter"
          :appointments="appointmentsList"
          :loading="isFetchingAppointments"
          :has-more="hasNextPage"
          :loading-more="isFetchingNextPage"
          :show-actions="true"
          :default-client="client"
          @status-change="onStatusChange"
          @load-more="fetchNextPage"
        />
      </section>
    </template>

    <ClientModal v-model:open="editModalOpen" mode="edit" :client="client" />

    <ClientDeleteModal
      v-model:open="deleteModalOpen"
      :client="client"
      @deleted="onDeleted"
    />
  </div>
</template>
