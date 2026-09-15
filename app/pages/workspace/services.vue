<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
});
const {
  data: services,
  isFetching,
  isError,
  refetch,
  activeFilter,
} = useServices();

const openModal = ref(false);
const serviceToEdit = ref<Service | null>(null);

const openDeleteModal = ref(false);
const serviceToDelete = ref<Service | null>(null);

const { mutateAsync: updateService, isPending: restoring } = useUpdateService();
const toast = useToast();

function openModalFn(service?: Service) {
  serviceToEdit.value = service ?? null;
  openModal.value = true;
}

function openDeleteModalFn(service: Service) {
  serviceToDelete.value = service;
  openDeleteModal.value = true;
}

async function onRestore(service: Service) {
  try {
    await updateService({ id: service.id, service: { is_active: true } });
    toast.add({
      title: "Servicio reactivado",
      description: `${service.name} volvió a tu lista y a tu página pública`,
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
}
</script>

<template>
  <div class="space-y-4">
    <LayoutPageHeader
      title="Servicios"
      description="Gestiona los servicios que ofreces"
      icon="i-lucide-scissors"
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
          icon="i-lucide-plus"
          size="lg"
          aria-label="Nuevo servicio"
          :disabled="restoring"
          @click="openModalFn()"
        />
      </template>
    </LayoutPageHeader>
    <AppQueryErrorState
      v-if="isError"
      title="No pudimos cargar tus servicios"
      @retry="refetch()"
    />
    <ServiceList
      v-else
      v-model:active-filter="activeFilter"
      :services="services || []"
      :loading="isFetching"
      @edit="openModalFn"
      @delete="openDeleteModalFn"
      @restore="onRestore"
      @create="openModalFn()"
    />
    <ServiceModal
      v-model:open="openModal"
      :mode="serviceToEdit ? 'edit' : 'create'"
      :service="serviceToEdit || undefined"
    />
    <ServiceDeleteModal
      v-model:open="openDeleteModal"
      :service="serviceToDelete || undefined"
    />
  </div>
</template>
