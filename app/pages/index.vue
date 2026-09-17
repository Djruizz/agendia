<script setup lang="ts">
definePageMeta({
  layout: "landing",
});

useSeoMeta({
  title: "Agendia — Agenda, clientes y ganancias para profesionales",
  description:
    "Gestiona tus citas, clientes y servicios en un solo lugar. Comparte tu página pública y recibe contactos por WhatsApp. Pruébala gratis por 1 mes.",
  ogTitle: "Agendia — Organiza tu agenda sin esfuerzo",
  ogDescription:
    "Citas, clientes, servicios y ganancias en un solo lugar, con página pública para tu negocio.",
  ogImage: "/agendia-text-transparent.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <div>
    <LandingHero />
    <LandingFeatures />
    <LandingPublicPageSection />
    <LandingEarningsSection />
    <LandingMobileSection />
    <LandingFaq />
    <LandingCta />
  </div>
</template>
