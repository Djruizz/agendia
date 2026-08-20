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
    <div class="space-y-4">
      <SettingsSection
        icon="i-lucide-palette"
        title="Accesibilidad"
        description="Mejorá la experiencia de uso de la aplicación."
      >
        <div class="flex flex-col gap-3">
          <SettingsRow
            label="Color de la app"
            description="Color principal de la marca"
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
    </div>
  </div>
</template>
