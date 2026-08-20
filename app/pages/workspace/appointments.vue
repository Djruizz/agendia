<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});

const {
  data: paginated,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  statusFilter,
  refetch,
  fetchNextPage,
} = useInfiniteAppointments();

const appointmentsList = computed(() => {
  return paginated.value?.pages.flatMap((page) => page.data) ?? [];
});

const onStatusChange = (value: AppointmentStatusFilter) => {
  statusFilter.value = value;
};

const managerRef = useTemplateRef<{ openCreate: () => void }>("managerRef");

const onCreate = () => {
  managerRef.value?.openCreate();
};
</script>

<template>
  <div class="space-y-4">
    <LayoutPageHeader
      title="Citas"
      description="Consulta y administra tus citas"
      icon="i-lucide-calendar-check"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="link"
          color="neutral"
          :class="{ 'animate-spin': isFetching }"
          @click="refetch()"
        />
        <UButton
          icon="i-lucide-plus"
          color="primary"
          size="lg"
          @click="onCreate"
        />
      </template>
    </LayoutPageHeader>

    <AppointmentManager
      ref="managerRef"
      v-model:status-filter="statusFilter"
      :appointments="appointmentsList"
      :loading="isFetching"
      :has-more="hasNextPage"
      :loading-more="isFetchingNextPage"
      :show-actions="true"
      @status-change="onStatusChange"
      @load-more="fetchNextPage"
    />
  </div>
</template>
