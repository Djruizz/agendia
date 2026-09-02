<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
});
const { data: services, isFetching, refetch } = useServices();

const openModal = ref(false);
const serviceToEdit = ref<Service | null>(null);

const openDeleteModal = ref(false);
const serviceToDelete = ref<Service | null>(null);

function openModalFn(service?: Service) {
  serviceToEdit.value = service ?? null;
  openModal.value = true;
}

function openDeleteModalFn(service: Service) {
  serviceToDelete.value = service;
  openDeleteModal.value = true;
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
          :class="{ 'animate-spin': isFetching }"
          @click="refetch()"
        />
        <UButton icon="i-lucide-plus" size="lg" @click="openModalFn()" />
      </template>
    </LayoutPageHeader>
    <ServiceList
      :services="services || []"
      :loading="isFetching"
      @edit="openModalFn"
      @delete="openDeleteModalFn"
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
