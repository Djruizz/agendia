<script setup lang="ts">
const bullets = [
  "Tu enlace único y personalizable (slug)",
  "Logo y color de tu marca",
  "Catálogo de servicios con precios",
  "Botón de contacto por WhatsApp",
];
</script>

<template>
  <UPageSection
    id="pagina-publica"
    class="scroll-mt-24"
    headline="Página pública"
    title="Tu negocio, a un enlace de distancia"
    description="Sin conocer de diseño, tienes una página propia para compartir por WhatsApp o redes. Tus clientes ven tus servicios y te contactan directo."
  >
    <template #body>
      <ul class="space-y-3 text-left">
        <li
          v-for="bullet in bullets"
          :key="bullet"
          class="flex items-start gap-2.5"
        >
          <UIcon
            name="i-lucide-check"
            class="size-5 text-primary shrink-0 mt-0.5"
          />
          <span class="text-sm sm:text-base text-default">{{ bullet }}</span>
        </li>
      </ul>
      <UButton
        to="/register"
        label="Crear mi página"
        trailing-icon="i-lucide-arrow-right"
        size="lg"
        class="mt-8"
      />
    </template>

    <LandingReveal>
      <LandingPublicPageMock />
    </LandingReveal>
  </UPageSection>
</template>
