<script setup lang="ts">
const services = [
  { name: "Corte de cabello", duration: "45 min", price: "$300" },
  { name: "Tinte completo", duration: "1h 30min", price: "$950" },
];
</script>

<template>
  <div
    class="rounded-xl bg-default ring ring-default shadow-2xl overflow-hidden text-left p-5 space-y-5"
  >
    <div class="flex items-center gap-4">
      <div
        class="size-14 rounded-xl ring-1 ring-default bg-elevated flex items-center justify-center shrink-0"
      >
        <UIcon name="i-lucide-scissors" class="size-6 text-primary" />
      </div>
      <div class="min-w-0">
        <p class="text-lg font-bold text-highlighted truncate">
          Estudio Bella
        </p>
        <p class="text-sm text-muted">Salón y barbería</p>
      </div>
    </div>

    <p class="text-sm text-muted line-clamp-2">
      Cuidamos tu imagen con atención personalizada. Agenda tu cita en
      segundos y sin llamadas.
    </p>

    <div class="space-y-2">
      <div
        v-for="service in services"
        :key="service.name"
        class="rounded-lg bg-elevated/50 p-3 flex items-center justify-between gap-3"
      >
        <p class="text-sm font-semibold text-highlighted truncate">
          {{ service.name }}
        </p>
        <div class="flex items-center gap-3 text-sm shrink-0">
          <div class="flex items-center gap-1.5">
            <UIcon name="i-lucide-clock" class="size-4 text-dimmed" />
            <span class="text-muted">{{ service.duration }}</span>
          </div>
          <span class="font-medium text-highlighted">{{ service.price }}</span>
        </div>
      </div>
    </div>

    <UButton
      icon="i-lucide-message-circle"
      label="Contactar por WhatsApp"
      color="primary"
      size="lg"
      block
      class="cursor-default"
    />

    <p class="text-[10px] text-dimmed text-center truncate">
      /p/estudio-bella — tu enlace único para compartir
    </p>
  </div>
</template>
