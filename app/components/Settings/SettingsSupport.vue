<script setup lang="ts">
const { enabled: supportEnabled, supportUrl } = useSupportWhatsApp();

const faq = [
  {
    label: "¿Cómo agendo mi primera cita?",
    content:
      "Necesitas al menos un servicio y un cliente registrados. Ve a las secciones Servicios y Clientes para crearlos, y después agenda tu cita desde Citas o Calendario.",
  },
  {
    label: "¿Cómo instalo la app en mi teléfono?",
    content:
      "Abre Agendia en el navegador de tu teléfono, toca el menú Compartir y elige 'Añadir a pantalla de inicio'. La app quedará instalada como cualquier otra aplicación.",
  },
  {
    label: "¿Cómo comparto mi página de reservas?",
    content:
      "En Configuración > Perfil de negocio encontrarás tu enlace público. Compártelo con tus clientes para que vean tus servicios y tu información de contacto.",
  },
  {
    label: "¿Qué pasa si olvidé mi contraseña?",
    content:
      "En la pantalla de inicio de sesión toca '¿Olvidaste tu contraseña?' y sigue las instrucciones que llegarán a tu correo.",
  },
  {
    label: "¿Puedo personalizar el color de la app?",
    content:
      "Sí. Ve a Configuración > Apariencia y elige tu color favorito. También puedes activar el modo oscuro.",
  },
  {
    label: "¿Mis datos están a salvo?",
    content:
      "Tu información está aislada de otros usuarios y solo tú puedes verla. Estamos en versión beta: te recomendamos mantener una copia de tus datos importantes.",
  },
];
</script>

<template>
  <SettingsSection
    icon="i-lucide-life-buoy"
    title="Ayuda y soporte"
    description="Preguntas frecuentes y contacto directo con nosotros."
  >
    <SettingsRow
      label="Soporte por WhatsApp"
      description="Escríbenos, respondemos en menos de 24 horas."
    >
      <UButton
        v-if="supportEnabled"
        :to="supportUrl"
        target="_blank"
        icon="i-lucide-message-circle"
        label="Escribir"
        color="primary"
        variant="outline"
        class="cursor-pointer"
      />
      <p v-else class="text-xs text-muted">Disponible próximamente.</p>
    </SettingsRow>

    <div>
      <p class="text-sm font-semibold text-highlighted mb-3">
        Preguntas frecuentes
      </p>
      <UAccordion :items="faq" />
    </div>
  </SettingsSection>
</template>
