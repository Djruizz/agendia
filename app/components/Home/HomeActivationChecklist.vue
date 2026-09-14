<script setup lang="ts">
const { data: servicesCount, isFetching: servicesLoading } =
  useTotalServices();
const { data: clientsCount, isFetching: clientsLoading } = useTotalClients();
const { data: appointmentsCount, isFetching: appointmentsLoading } =
  useTotalAppointments();

const steps = computed(() => [
  {
    icon: "i-lucide-scissors",
    label: "Crea tu primer servicio",
    done: (servicesCount.value ?? 0) > 0,
    loading: servicesLoading.value,
    to: "/workspace/services",
    cta: "Ir a Servicios",
  },
  {
    icon: "i-lucide-users",
    label: "Registra tu primer cliente",
    done: (clientsCount.value ?? 0) > 0,
    loading: clientsLoading.value,
    to: "/workspace/clients",
    cta: "Ir a Clientes",
  },
  {
    icon: "i-lucide-calendar-check",
    label: "Agenda tu primera cita",
    done: (appointmentsCount.value ?? 0) > 0,
    loading: appointmentsLoading.value,
    to: "/workspace/appointments",
    cta: "Ir a Citas",
  },
]);

const completed = computed(() => steps.value.every((step) => step.done));
</script>

<template>
  <UCard v-if="!completed" variant="subtle">
    <template #header>
      <div class="flex items-center gap-2 min-w-0">
        <UIcon name="i-lucide-rocket" class="size-5 text-primary shrink-0" />
        <div class="min-w-0">
          <h2 class="text-md font-semibold text-highlighted">
            Empieza con tu agenda
          </h2>
          <p class="text-sm text-muted">
            Completa estos 3 pasos para aprovechar Agendia al máximo.
          </p>
        </div>
      </div>
    </template>

    <ul class="space-y-3">
      <li
        v-for="step in steps"
        :key="step.label"
        class="flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="flex items-center justify-center size-8 rounded-lg shrink-0"
            :class="
              step.done
                ? 'bg-primary/10 text-primary'
                : 'bg-elevated text-muted'
            "
          >
            <UIcon
              :name="step.done ? 'i-lucide-check' : step.icon"
              class="size-4"
            />
          </div>
          <USkeleton v-if="step.loading" class="h-4 w-32" />
          <p
            v-else
            class="text-sm font-medium text-highlighted truncate"
            :class="step.done && 'line-through text-muted'"
          >
            {{ step.label }}
          </p>
        </div>
        <UBadge
          v-if="step.done"
          label="Listo"
          color="success"
          variant="subtle"
          class="shrink-0"
        />
        <UButton
          v-else-if="!step.loading"
          :to="step.to"
          :label="step.cta"
          size="sm"
          color="primary"
          variant="soft"
          class="shrink-0 cursor-pointer"
        />
      </li>
    </ul>
  </UCard>
</template>
