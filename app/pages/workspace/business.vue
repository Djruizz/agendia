<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: ["auth", "onboarding"],
});
</script>

<template>
  <div class="space-y-6">
    <LayoutPageHeader
      title="Mi Negocio"
      description="Gestiona los datos comerciales y la presencia pública de tu marca"
      icon="i-lucide-store"
    />
    <div class="p-1 space-y-6">
      <SettingsBusinessProfile />
      <SettingsBusinessSocials />
    </div>
  </div>
</template>
