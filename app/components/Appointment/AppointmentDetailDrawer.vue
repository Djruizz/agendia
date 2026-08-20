<script setup lang="ts">
import type { AppointmentWithRelations } from "~/types/appointments";
const props = defineProps<{
  appointment?: AppointmentWithRelations;
}>();

const emit = defineEmits<{
  edit: [appointment: AppointmentWithRelations];
  delete: [appointment: AppointmentWithRelations];
  uncancel: [appointment: AppointmentWithRelations];
  advance: [appointment: AppointmentWithRelations];
  cancel: [appointment: AppointmentWithRelations];
  reagendar: [appointment: AppointmentWithRelations];
}>();

const open = defineModel<boolean>("open", { default: false });

const {
  getStatusColor,
  getStatusIcon,
  getStatusLabel,
  isReagendada,
  needsFollowUp,
} = AppointmentStatus();
const { formatDate, formatTime, weeksSince } = DateUtils();
const { followUpViaWhatsApp } = useAppointmentActions();

const clientName = computed(
  () => props.appointment?.clients?.name || "Sin cliente",
);

const serviceName = computed(
  () => props.appointment?.services?.name || "Sin servicio",
);

const isClientInactive = computed(
  () => props.appointment?.clients?.is_active === false,
);

const formattedDate = computed(() => {
  if (!props.appointment) return "";
  return formatDate(props.appointment.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  if (!props.appointment) return "";
  return formatTime(props.appointment.date, {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const statusMeta = computed(() => {
  if (!props.appointment) return null;
  return {
    label: getStatusLabel(props.appointment.status),
    color: getStatusColor(props.appointment.status),
    icon: getStatusIcon(props.appointment.status),
  };
});

const isReagendadaAppt = computed(() =>
  props.appointment ? isReagendada(props.appointment) : false,
);

const needsFollowUpAppt = computed(() =>
  props.appointment ? needsFollowUp(props.appointment) : false,
);

const weeksAgoText = computed(() => {
  if (!props.appointment) return "";
  return `${weeksSince(props.appointment.date)} semanas`;
});

type NextStatus = {
  status: AppointmentWithRelations["status"];
  color: "primary" | "success" | "warning" | "error" | "info" | "neutral";
  icon: string;
  label: string;
};

const nextStatus = computed<NextStatus | null>(() => {
  if (!props.appointment) return null;
  if (props.appointment.status === "PENDING")
    return {
      status: "CONFIRMED",
      color: "info",
      icon: "i-lucide-check",
      label: "Confirmar cita",
    };
  if (props.appointment.status === "CONFIRMED")
    return {
      status: "COMPLETED",
      color: "success",
      icon: "i-lucide-check-check",
      label: "Marcar como completada",
    };
  return null;
});

function onAdvanceStatus() {
  if (!props.appointment || !nextStatus.value) return;
  emit("advance", props.appointment);
  open.value = false;
}

type CancelAction = {
  label: string;
  color: "error" | "warning";
  icon: string;
};

const cancelStatus = computed<CancelAction | null>(() => {
  if (!props.appointment) return null;
  if (props.appointment.status === "COMPLETED") return null;
  if (props.appointment.status === "CANCELED") {
    return {
      label: "Reactivar cita",
      color: "warning",
      icon: "i-lucide-rotate-ccw",
    };
  }
  return {
    label: "Cancelar cita",
    color: "error",
    icon: "i-lucide-x-circle",
  };
});

function onCancelOrReactivate() {
  if (!props.appointment || !cancelStatus.value) return;
  if (props.appointment.status === "CANCELED") {
    emit("uncancel", props.appointment);
  } else {
    emit("cancel", props.appointment);
  }
  open.value = false;
}

type FollowUpAction = {
  label: string;
  color: "success";
  icon: string;
};

const markReagendada = computed<FollowUpAction | null>(() => {
  if (!props.appointment) return null;
  if (props.appointment.status !== "COMPLETED") return null;
  if (props.appointment.followed_up) return null;
  return {
    label: "Marcar reagendada",
    color: "success",
    icon: "i-lucide-calendar-check",
  };
});

function onMarkReagendada() {
  if (!props.appointment) return;
  emit("reagendar", props.appointment);
  open.value = false;
}

function onSendReminder() {
  if (!props.appointment) return;
  followUpViaWhatsApp(props.appointment);
}

function onEdit() {
  if (!props.appointment) return;
  emit("edit", props.appointment);
  open.value = false;
}

function onDelete() {
  if (!props.appointment) return;
  emit("delete", props.appointment);
  open.value = false;
}
</script>

<template>
  <UDrawer v-model:open="open" direction="right">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          v-if="statusMeta"
          class="flex items-center justify-center size-10 rounded-xl shrink-0"
          :class="{
            'bg-warning/10 text-warning': statusMeta.color === 'warning',
            'bg-info/10 text-info': statusMeta.color === 'info',
            'bg-success/10 text-success': statusMeta.color === 'success',
            'bg-error/10 text-error': statusMeta.color === 'error',
            'bg-neutral/10 text-neutral': statusMeta.color === 'neutral',
            'bg-primary/10 text-primary': statusMeta.color === 'primary',
          }"
        >
          <UIcon :name="statusMeta.icon" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-base font-semibold text-highlighted truncate">
            {{ clientName }}
          </p>
          <p class="text-xs text-muted truncate">{{ serviceName }}</p>
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="appointment" class="space-y-5">
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-if="statusMeta"
            :label="statusMeta.label"
            :color="statusMeta.color"
            variant="subtle"
            :icon="statusMeta.icon"
          />
          <UBadge
            v-if="isClientInactive"
            label="Inactiva"
            color="neutral"
            variant="subtle"
            icon="i-lucide-user-x"
          />
          <UBadge
            v-if="isReagendadaAppt"
            label="Reagendada"
            color="success"
            variant="subtle"
            icon="i-lucide-calendar-check"
          />
          <UBadge
            v-if="needsFollowUpAppt"
            :label="weeksAgoText"
            color="primary"
            variant="subtle"
            icon="i-lucide-bell-ring"
          />
        </div>

        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <UIcon
              name="i-lucide-calendar-days"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="min-w-0">
              <p class="text-xs text-muted">Fecha</p>
              <p class="text-sm text-highlighted">{{ formattedDate }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon
              name="i-lucide-clock"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="min-w-0">
              <p class="text-xs text-muted">Hora</p>
              <p class="text-sm text-highlighted">{{ formattedTime }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <UIcon
              name="i-lucide-hourglass"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="min-w-0">
              <p class="text-xs text-muted">Duración</p>
              <p class="text-sm text-highlighted">
                {{ appointment.duration_minutes }} minutos
              </p>
            </div>
          </div>

          <div v-if="appointment.price !== null" class="flex items-start gap-3">
            <UIcon
              name="i-lucide-dollar-sign"
              class="size-4 text-muted shrink-0 mt-0.5"
            />
            <div class="min-w-0">
              <p class="text-xs text-muted">Precio</p>
              <p class="text-sm text-highlighted">
                ${{ appointment.price.toLocaleString("es-MX") }}
              </p>
            </div>
          </div>

          <div
            v-if="appointment.clients?.phone"
            class="flex items-start justify-between gap-3"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-phone"
                class="size-4 text-muted shrink-0 mt-0.5"
              />
              <div class="min-w-0">
                <p class="text-xs text-muted">Teléfono</p>
                <p class="text-sm text-highlighted">
                  {{ appointment.clients.phone }}
                </p>
              </div>
            </div>
            <UButton
              icon="i-lucide-message-circle"
              variant="link"
              color="success"
              size="lg"
              :aria-label="`Enviar mensaje a ${clientName}`"
              :title="`Enviar mensaje a ${clientName}`"
              target="_blank"
              :to="`https://wa.me/${appointment.clients.phone}`"
            />
          </div>
        </div>

        <div
          v-if="appointment.notes"
          class="rounded-lg bg-elevated/40 p-3 space-y-1"
        >
          <p class="text-xs text-muted">Notas</p>
          <p class="text-sm text-highlighted whitespace-pre-wrap">
            {{ appointment.notes }}
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex items-center justify-around gap-2">
        <UButton
          v-if="appointment"
          label="Eliminar"
          color="error"
          variant="ghost"
          class="w-full flex justify-center"
          icon="i-lucide-trash-2"
          @click="onDelete"
        />
        <UButton
          v-if="appointment"
          label="Editar"
          color="neutral"
          variant="soft"
          class="w-full flex justify-center"
          icon="i-lucide-pencil"
          @click="onEdit"
        />
      </div>
      <UButton
        v-if="nextStatus"
        :label="nextStatus.label"
        :color="nextStatus.color"
        :icon="nextStatus.icon"
        size="lg"
        class="w-full flex justify-center"
        @click="onAdvanceStatus"
      />
      <UButton
        v-if="cancelStatus"
        :label="cancelStatus.label"
        :color="cancelStatus.color"
        :icon="cancelStatus.icon"
        variant="ghost"
        class="w-full flex justify-center"
        @click="onCancelOrReactivate"
      />
      <UButton
        v-if="markReagendada"
        :label="markReagendada.label"
        :color="markReagendada.color"
        :icon="markReagendada.icon"
        class="w-full flex justify-center"
        @click="onMarkReagendada"
      />
      <UButton
        v-if="needsFollowUpAppt"
        label="Enviar recordatorio"
        color="primary"
        variant="soft"
        icon="i-lucide-bell-ring"
        class="w-full flex justify-center"
        @click="onSendReminder"
      />
    </template>
  </UDrawer>
</template>
