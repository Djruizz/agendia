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
        title="Tema"
        description="Personalizá la apariencia de la aplicación."
      >
        <SettingsColorSelect />
      </SettingsSection>
    </div>
  </div>
</template>
