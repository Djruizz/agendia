<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});

const route = useRoute();
const { localDayKey } = DateUtils();
const now = new Date();

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const queryDate =
  typeof route.query.date === "string" && DATE_PATTERN.test(route.query.date)
    ? route.query.date
    : null;

const initialDate = queryDate ? new Date(`${queryDate}T00:00:00`) : now;

const year = ref(initialDate.getFullYear());
const month = ref(initialDate.getMonth() + 1);

const selectedDate = ref<string | null>(queryDate ?? localDayKey(now));
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
  <div class="space-y-4">
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
