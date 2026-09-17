<script setup lang="ts">
const appointments = [
  {
    client: "Fernando López",
    service: "Corte + barba",
    price: "$350",
    time: "10:30",
    date: "vie 18 sep",
    status: "Confirmada",
    icon: "i-lucide-check",
    iconClass: "bg-info/10 text-info",
  },
  {
    client: "Daniela Ruiz",
    service: "Tinte de cabello",
    price: "$800",
    time: "12:00",
    date: "vie 18 sep",
    status: "Pendiente",
    icon: "i-lucide-clock",
    iconClass: "bg-warning/10 text-warning",
  },
  {
    client: "Carlos Méndez",
    service: "Afeitado clásico",
    price: "$250",
    time: "16:00",
    date: "vie 18 sep",
    status: "Completada",
    icon: "i-lucide-check-check",
    iconClass: "bg-success/10 text-success",
  },
];

const stats = [
  {
    icon: "i-lucide-circle-dollar-sign",
    label: "Ganancias del mes",
    value: "$12,400",
  },
  { icon: "i-lucide-calendar-check", label: "Citas del mes", value: "38" },
  { icon: "i-lucide-users", label: "Clientes", value: "21" },
];
</script>

<template>
  <div
    class="rounded-xl bg-default ring ring-default shadow-2xl overflow-hidden text-left"
  >
    <div class="flex items-center gap-2 px-4 py-3 border-b border-default">
      <span class="size-2.5 rounded-full bg-error/60" />
      <span class="size-2.5 rounded-full bg-warning/60" />
      <span class="size-2.5 rounded-full bg-success/60" />
      <p class="text-xs font-medium text-muted mx-auto pr-14">
        Agendia · Viernes 18 de septiembre
      </p>
    </div>

    <div class="p-4 space-y-3">
      <div
        v-for="appointment in appointments"
        :key="appointment.client"
        class="flex items-start gap-4 rounded-lg bg-elevated/50 p-3"
      >
        <div
          class="flex items-center justify-center size-11 rounded-xl shrink-0"
          :class="appointment.iconClass"
        >
          <UIcon :name="appointment.icon" class="size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-semibold text-highlighted truncate">
              {{ appointment.client }}
            </p>
            <UBadge size="sm" variant="subtle" :label="appointment.status" />
          </div>
          <p class="text-sm text-muted truncate">
            {{ appointment.service }} — {{ appointment.price }}
          </p>
          <div class="flex items-center gap-3 mt-1.5">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-lucide-clock" class="size-3.5 text-dimmed" />
              <p class="text-xs text-muted">{{ appointment.time }}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar-days"
                class="size-3.5 text-dimmed"
              />
              <p class="text-xs text-muted">{{ appointment.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3 p-4 border-t border-default">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg bg-elevated/50 p-3"
      >
        <div class="flex items-center gap-1.5 mb-1">
          <UIcon :name="stat.icon" class="size-3.5 text-dimmed" />
          <p class="text-[10px] text-muted truncate">{{ stat.label }}</p>
        </div>
        <p class="text-sm font-bold text-highlighted">{{ stat.value }}</p>
      </div>
    </div>
  </div>
</template>
