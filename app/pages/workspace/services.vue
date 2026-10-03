<script setup lang="ts">
import {
  MAX_PUBLIC_SERVICES,
  usePublicServicesCount,
} from "~/composables/Service/queries/useServices";

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

const { data: publicCount } = usePublicServicesCount();

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
      description: `${service.name} volvió a tu lista activa`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
  } catch (err: any) {
    toast.add({
      title: "No se pudo reactivar el servicio",
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
      description="Gestiona los servicios de tu agenda y tu catálogo público"
      icon="i-lucide-scissors"
    >
      <template #actions>
        <UBadge
          :color="(publicCount ?? 0) >= MAX_PUBLIC_SERVICES ? 'warning' : 'neutral'"
          variant="subtle"
          size="md"
          icon="i-lucide-globe"
          class="hidden sm:inline-flex"
        >
          Públicos: {{ publicCount ?? 0 }} / {{ MAX_PUBLIC_SERVICES }}
        </UBadge>
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
