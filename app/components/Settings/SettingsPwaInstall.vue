<script setup lang="ts">
const { canInstall, isInstalled, isIOS, isMobile, isMacSafari, install } =
  usePwaInstall();
</script>

<template>
  <SettingsSection
    :icon="isMobile ? 'i-lucide-smartphone' : 'i-lucide-laptop'"
    title="Aplicación en tu dispositivo"
    :description="
      isMobile
        ? 'Instala Agendia para acceder en un toque y usarla a pantalla completa.'
        : 'Instala Agendia en tu computadora para abrirla en su propia ventana desde la barra de tareas o el Dock.'
    "
  >
    <SettingsRow
      :label="isMobile ? 'Acceso directo (PWA)' : 'App de escritorio (PWA)'"
      :description="
        isInstalled
          ? isMobile
            ? 'Agendia ya está instalada y funcionando como app en este dispositivo.'
            : 'Agendia ya está instalada y funcionando como app de escritorio en este equipo.'
          : isIOS
          ? 'Agrégala a tu pantalla de inicio desde Safari para una experiencia a pantalla completa.'
          : isMacSafari
          ? 'En Safari para Mac: ve a Archivo > Agregar al Dock para tener Agendia como app de escritorio.'
          : canInstall
          ? isMobile
            ? 'Instálala en tu pantalla de inicio para una experiencia más rápida y sin barras de navegación.'
            : 'Instálala en tu computadora para acceder rápido desde el menú inicio, barra de tareas o Dock.'
          : 'Puedes agregar Agendia desde el menú de opciones de tu navegador.'
      "
      wrap
    >
      <div
        v-if="isInstalled"
        class="flex items-center gap-1.5 text-success text-sm font-medium"
      >
        <UIcon name="i-lucide-check-circle" class="size-4 shrink-0" />
        <span>Instalada</span>
      </div>

      <UButton
        v-else-if="canInstall"
        icon="i-lucide-download"
        color="primary"
        variant="solid"
        size="sm"
        :label="
          isIOS
            ? 'Cómo instalar en iPhone'
            : isMobile
            ? 'Instalar aplicación'
            : 'Instalar en tu computadora'
        "
        class="cursor-pointer font-medium"
        @click="install"
      />

      <UBadge
        v-else
        color="neutral"
        variant="subtle"
        :label="
          isMacSafari
            ? 'Usa Archivo > Agregar al Dock'
            : 'Disponible en navegador'
        "
      />
    </SettingsRow>
  </SettingsSection>
</template>
