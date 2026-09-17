<script setup lang="ts">
const features = [
  {
    icon: "i-lucide-calendar-check",
    title: "Citas de punta a punta",
    description:
      "Crea, confirma y completa citas con precio y notas. Cancela y recupera sin perder nada.",
  },
  {
    icon: "i-lucide-bell-ring",
    title: "Seguimiento inteligente",
    description:
      "Te recordamos a qué clientes dar seguimiento después de cada visita.",
  },
  {
    icon: "i-lucide-users",
    title: "Clientes e historial",
    description:
      "Tu cartera completa con historial. Desactiva y reactiva clientes cuando necesites.",
  },
  {
    icon: "i-lucide-scissors",
    title: "Catálogo de servicios",
    description:
      "Define nombre, precio y duración. La duración se aplica sola al agendar.",
  },
  {
    icon: "i-lucide-calendar-days",
    title: "Calendario mensual",
    description:
      "Ve tu mes completo con el conteo de citas por día y salta a cualquier fecha.",
  },
  {
    icon: "i-lucide-chart-no-axes-column",
    title: "Ganancias",
    description:
      "Consulta tus ingresos por día, mes o año y compáralos con períodos anteriores.",
  },
  {
    icon: "i-lucide-store",
    title: "Página pública",
    description:
      "Comparte tu enlace: servicios, logo, color de marca y contacto por WhatsApp.",
  },
  {
    icon: "i-lucide-message-circle",
    title: "WhatsApp integrado",
    description:
      "Envía confirmaciones y recordatorios por WhatsApp con tus propias plantillas.",
  },
];
</script>

<template>
  <UPageSection
    id="features"
    class="scroll-mt-24"
    headline="Todo incluido"
    title="Todo lo que tu negocio necesita"
    description="Gestión real de citas, clientes y dinero, pensada para profesionales que trabajan solos."
  >
    <template #body>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LandingReveal
          v-for="(feature, index) in features"
          :key="feature.title"
          :delay="(index % 4) * 75"
          class="h-full"
        >
          <div
            class="h-full rounded-lg bg-elevated/50 ring ring-default p-5 text-center"
          >
            <div
              class="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4"
            >
              <UIcon :name="feature.icon" class="size-6" />
            </div>
            <h3 class="font-semibold text-default mb-2">
              {{ feature.title }}
            </h3>
            <p class="text-sm text-muted">
              {{ feature.description }}
            </p>
          </div>
        </LandingReveal>
      </div>
    </template>
  </UPageSection>
</template>
