<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Citas"
      description="Consulta y administra tus citas"
      icon="i-lucide-calendar-check"
    />
  </div>
</template>
