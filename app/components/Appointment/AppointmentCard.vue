<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { AppointmentWithRelations } from "~/types/appointments";

const props = defineProps<{
  appointment: AppointmentWithRelations;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  edit: [appointment: AppointmentWithRelations];
  detail: [appointment: AppointmentWithRelations];
  delete: [appointment: AppointmentWithRelations];
  restore: [appointment: AppointmentWithRelations];
  reagendar: [appointment: AppointmentWithRelations];
}>();

const { getStatusColor, getStatusIcon, isReagendada, needsFollowUp } =
  AppointmentStatus();
const { formatDate, formatTime, weeksSince } = useDateUtils();
const { weeksToFollowUp } = useWeeksToFollowUp();
const { followUpViaWhatsApp } = useAppointmentActions();

const clientName = computed(
  () => props.appointment.clients?.name || "Sin cliente",
);

const isClientInactive = computed(() => {
  return props.appointment.clients?.is_active === false;
});

const serviceName = computed(
  () => props.appointment.services?.name || "Sin servicio",
);

const formattedDate = computed(() => {
  return formatDate(props.appointment.date, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  return formatTime(props.appointment.date, {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const statusColor = computed(() => {
  return getStatusColor(props.appointment.status);
});

const statusIcon = computed(() => {
  return getStatusIcon(props.appointment.status);
});

const statusIconClasses = computed(() => {
  const map: Record<string, string> = {
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
    neutral: "bg-neutral/10 text-neutral",
  };
  return map[statusColor.value] || "bg-primary/10 text-primary";
});

const isReagendadaAppt = computed(() => isReagendada(props.appointment));
const needsFollowUpAppt = computed(() =>
  needsFollowUp(props.appointment, weeksToFollowUp.value),
);

const weeksAgoText = computed(() => {
  return `${weeksSince(props.appointment.date)} semanas`;
});

const items = computed<DropdownMenuItem[][]>(() => {
  const status = props.appointment.status;
  const menuItems: DropdownMenuItem[][] = [];

  menuItems.push([
    {
      label: "Editar",
      icon: "i-lucide-pencil",
      onSelect: () => emit("edit", props.appointment),
    },
  ]);

  if (needsFollowUpAppt.value) {
    const followUpGroup: DropdownMenuItem[] = [];
    if (props.appointment.clients?.phone) {
      followUpGroup.push({
        label: "Seguimiento",
        icon: "i-lucide-message-circle",
        color: "primary",
        onSelect: () => followUpViaWhatsApp(props.appointment),
      });
    }
    followUpGroup.push({
      label: "Marcar reagendada",
      icon: "i-lucide-calendar-check",
      color: "success",
      onSelect: () => emit("reagendar", props.appointment),
    });
    menuItems.push(followUpGroup);
  }
  menuItems.push([
    {
      label: "Eliminar",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => emit("delete", props.appointment),
    },
  ]);

  if (status === "CANCELED") {
    menuItems.push([
      {
        label: "Recuperar",
        icon: "i-lucide-rotate-ccw",
        color: "success",
        onSelect: () => emit("restore", props.appointment),
      },
    ]);
  }

  return menuItems;
});

function onCardClick() {
  emit("detail", props.appointment);
}

const serviceWithPrice = (service: string, price: number | null) => {
  if (!price) return service;
  return `${service} - $${price}`;
};
</script>

<template>
  <UCard
    class="overflow-hidden w-full cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
    variant="subtle"
    :ui="{ body: 'p-4' }"
    @click="onCardClick"
  >
    <div class="flex justify-between items-start gap-4">
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <div
          class="flex items-center justify-center size-12 rounded-xl shrink-0"
          :class="statusIconClasses"
        >
          <UIcon :name="statusIcon" class="size-6" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <p class="text-sm font-semibold text-highlighted truncate">
              {{ clientName }}
            </p>
            <UBadge
              v-if="isClientInactive"
              size="sm"
              variant="subtle"
              color="neutral"
              icon="i-lucide-user-x"
              label="Inactiva"
            />
            <UBadge
              v-if="isReagendadaAppt"
              size="sm"
              variant="subtle"
              color="success"
              icon="i-lucide-calendar-check"
              label="Reagendada"
            />
            <UBadge
              v-if="needsFollowUpAppt"
              size="sm"
              variant="subtle"
              color="primary"
              icon="i-lucide-bell-ring"
              :label="weeksAgoText"
            />
          </div>
          <p class="text-sm text-muted truncate">
            {{ serviceWithPrice(serviceName, props.appointment.price) }}
          </p>
          <div class="flex items-center gap-3 mt-2">
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clock"
                class="size-3.5 text-muted shrink-0"
              />
              <p class="text-xs text-muted">{{ formattedTime }}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar-days"
                class="size-3.5 text-muted shrink-0"
              />
              <p class="text-xs text-muted">{{ formattedDate }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <UDropdownMenu v-if="showActions && items.length > 0" :items="items">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            size="sm"
            variant="link"
            color="neutral"
            class="cursor-pointer shrink-0"
            @click.stop
          />
        </UDropdownMenu>
      </div>
    </div>
  </UCard>
</template>
