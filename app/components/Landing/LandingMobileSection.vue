<script setup lang="ts">
const features = [
  {
    icon: "i-lucide-smartphone",
    title: "Instálala como app",
    description:
      "Agrega Agendia a tu pantalla de inicio y úsala como una app nativa, sin tiendas de apps.",
  },
  {
    icon: "i-lucide-moon",
    title: "Claro u oscuro",
    description:
      "Elige el tema que prefieras y personaliza el color de la aplicación a tu gusto.",
  },
  {
    icon: "i-lucide-wifi-off",
    title: "Aviso sin conexión",
    description:
      "Si te quedas sin internet, la app te avisa para que no pierdas tiempo ni trabajo.",
  },
];
</script>

<template>
  <LandingReveal>
    <UPageSection
      id="movil"
      class="scroll-mt-24"
      headline="En tu bolsillo"
      title="Hecha para usarla desde el celular"
      description="Entre cita y cita, revisa tu día desde el teléfono con la misma rapidez que en la computadora."
      :features="features"
    />
  </LandingReveal>
</template>
