<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Configuración"
      description="Ajustes generales de tu cuenta"
      icon="i-lucide-settings"
    />
    <div class="space-y-4 p-1">
      <SettingsSection
        icon="i-lucide-palette"
        title="Apariencia"
        description="Mejorá la experiencia de uso de la aplicación."
      >
        <div class="flex flex-col gap-4">
          <SettingsRow
            label="Color de la aplicación"
            description="Personaliza la aplicación con tu color favorito."
          >
            <SettingsColorSelect />
          </SettingsRow>
          <SettingsRow
            label="Apariencia"
            description="Claro, oscuro o del sistema"
          >
            <UColorModeSelect />
          </SettingsRow>
        </div>
      </SettingsSection>
      <SettingsSection
        icon="i-lucide-user-cog"
        title="Preferencias"
        description="Ajusta tus preferencias de uso"
      >
        <div class="flex flex-col gap-3">
          <SettingsRow
            label="Formato de horario"
            description="Elige el formato de horario que prefieras."
          >
            <SettingsTimeFormat />
          </SettingsRow>
        </div>
      </SettingsSection>
    </div>
  </div>
</template>
