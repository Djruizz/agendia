<script setup lang="ts">
definePageMeta({
  layout: "landing",
});

const features = [
  {
    icon: "i-lucide-calendar-check",
    title: "Gestiona tus citas",
    description:
      "Visualiza, crea y organiza todas tus citas desde un solo lugar.",
  },
  {
    icon: "i-lucide-users",
    title: "Administra clientes",
    description: "Lleva el control de tu cartera de clientes y su historial.",
  },
  {
    icon: "i-lucide-scissors",
    title: "Catálogo de servicios",
    description: "Define tus servicios, precios y duraciones fácilmente.",
  },
  {
    icon: "i-lucide-bar-chart-3",
    title: "Seguimiento en vivo",
    description: "Consulta el estado de cada cita con indicadores claros.",
  },
];
</script>

<template>
  <section class="relative overflow-hidden">
    <div class="max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center">
      <UBadge
        color="primary"
        variant="subtle"
        label="App para profesionales"
        class="mb-6"
      />
      <h1
        class="text-4xl sm:text-6xl font-extrabold tracking-tight text-(--ui-text) mb-6"
      >
        Organiza tu agenda
        <span class="text-primary">sin esfuerzo</span>
      </h1>
      <p
        class="text-lg sm:text-xl text-(--ui-text-muted) max-w-2xl mx-auto mb-10"
      >
        Agendia te ayuda a gestionar citas, clientes y servicios en un solo
        lugar. Simple, rápida y hecha para tu negocio.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <UButton
          to="/workspace"
          size="xl"
          icon="i-lucide-log-in"
          label="Entrar a la app"
        />
        <UButton
          to="/register"
          size="xl"
          color="neutral"
          variant="outline"
          icon="i-lucide-user-plus"
          label="Crear cuenta"
        />
      </div>
    </div>
  </section>

  <section class="border-t border-(--ui-border)">
    <div class="max-w-6xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard
          v-for="feature in features"
          :key="feature.title"
          class="text-center"
        >
          <div
            class="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4"
          >
            <UIcon :name="feature.icon" class="size-6" />
          </div>
          <h3 class="font-semibold text-(--ui-text) mb-2">
            {{ feature.title }}
          </h3>
          <p class="text-sm text-(--ui-text-muted)">
            {{ feature.description }}
          </p>
        </UCard>
      </div>
    </div>
  </section>

  <footer class="border-t border-(--ui-border)">
    <div
      class="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      <p class="text-sm text-(--ui-text-muted)">
        © {{ new Date().getFullYear() }} Agendia
      </p>
      <UButton
        to="/workspace"
        variant="ghost"
        size="sm"
        icon="i-lucide-log-in"
        label="Entrar"
      />
    </div>
  </footer>
</template>
