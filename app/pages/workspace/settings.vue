<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
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
      <SettingsBusinessProfile />
      <SettingsSection
        icon="i-lucide-palette"
        title="Apariencia"
        description="Mejora la experiencia de uso de la aplicación."
      >
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
      </SettingsSection>
      <SettingsSection
        icon="i-lucide-user-cog"
        title="Preferencias"
        description="Ajusta tus preferencias de uso"
      >
        <SettingsRow
          label="Formato de horario"
          description="Elige el formato de horario que prefieras."
        >
          <SettingsTimeFormat />
        </SettingsRow>
        <SettingsRow
          label="Semanas para recordar"
          description="Cantidad de semanas para marcar citas completadas como 'para recordar'."
        >
          <SettingsWeeksFollowUp />
        </SettingsRow>
      </SettingsSection>
      <SettingsAccountSecurity />
    </div>
  </div>
</template>
