<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

const items: AccordionItem[] = [
  {
    label: "¿Cómo obtengo acceso?",
    content:
      "Por ahora Agendia funciona por invitación. Escríbenos por WhatsApp, te agregamos a la lista y podrás crear tu cuenta en minutos.",
  },
  {
    label: "¿Cuánto cuesta?",
    content:
      "$100 al mes, con 1 mes de prueba gratis. El pago se coordina directo con nosotros (transferencia o efectivo); Agendia no procesa pagos en línea ni guarda datos de tarjetas.",
  },
  {
    label: "¿Mis clientes necesitan cuenta?",
    content:
      "No. Tus clientes solo visitan tu página pública, ven tus servicios y te contactan por WhatsApp. Nunca tienen que registrarse.",
  },
  {
    label: "¿Funciona en el celular?",
    content:
      "Sí. Agendia funciona en cualquier navegador del teléfono y además puedes instalarla como app desde el menú del navegador.",
  },
  {
    label: "¿Funciona sin internet?",
    content:
      "Parcialmente: puedes seguir navegando lo ya cargado y la app te avisa cuando no hay conexión. La sincronización de datos requiere internet.",
  },
  {
    label: "¿Cómo comparto mi página?",
    content:
      "Desde Configuración personalizas tu enlace público y lo compartes por WhatsApp o redes sociales. Cada negocio tiene su propio enlace.",
  },
];
</script>

<template>
  <UPageSection
    id="faq"
    class="scroll-mt-24"
    headline="Preguntas frecuentes"
    title="¿Tienes dudas?"
  >
    <template #body>
      <LandingReveal>
        <UAccordion :items="items" class="w-full max-w-2xl mx-auto text-left" />
      </LandingReveal>
    </template>
  </UPageSection>
</template>
