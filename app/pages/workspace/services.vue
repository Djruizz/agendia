<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Servicios"
      description="Gestiona los servicios que ofreces"
      icon="i-lucide-scissors"
    />
  </div>
</template>
