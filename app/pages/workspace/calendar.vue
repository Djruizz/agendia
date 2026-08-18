<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});

const now = new Date();
const year = ref(now.getFullYear());
const month = ref(now.getMonth() + 1);

const localDayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const selectedDate = ref<string | null>(localDayKey(now));
const statusFilter = ref<AppointmentStatusFilter>("ALL");

const { data: counts } = useAppointmentCounts(year, month);

const { data: dayAppointments, isFetching: dayFetching } =
  useAppointmentsByDay(selectedDate);

const { matchesStatus } = AppointmentStatus();

const filteredAppointments = computed(() =>
  (dayAppointments.value ?? []).filter((a) =>
    matchesStatus(a, statusFilter.value),
  ),
);

function onPrev() {
  if (month.value === 1) {
    month.value = 12;
    year.value--;
  } else {
    month.value--;
  }
}

function onNext() {
  if (month.value === 12) {
    month.value = 1;
    year.value++;
  } else {
    month.value++;
  }
}

const managerRef = useTemplateRef<{ openCreate: () => void }>("managerRef");

const onCreate = () => {
  managerRef.value?.openCreate();
};
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Calendario"
      description="Visualiza tus citas en el calendario"
      icon="i-lucide-calendar-days"
    >
      <template #actions>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          size="lg"
          @click="onCreate"
        />
      </template>
    </LayoutPageHeader>

    <Calendar
      v-model:selected-date="selectedDate"
      :year="year"
      :month="month"
      :counts="counts ?? new Map()"
      @prev="onPrev"
      @next="onNext"
      class="mb-6"
    />

    <AppointmentManager
      ref="managerRef"
      v-model:status-filter="statusFilter"
      :appointments="filteredAppointments"
      :loading="dayFetching"
      :show-actions="true"
    />
  </div>
</template>
