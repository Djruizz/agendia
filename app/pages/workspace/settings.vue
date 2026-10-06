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
      description="Ajustes generales de tu cuenta y preferencias de la aplicación"
      icon="i-lucide-settings"
    />
    <div class="space-y-4 p-1">
      <SettingsAppearance />
      <SettingsPwaInstall />
      <SettingsPreferences />
      <SettingsWhatsAppMessages />
      <SettingsAccountSecurity />
      <SettingsSupport />
      <SettingsDeleteAccount />
    </div>
  </div>
</template>
