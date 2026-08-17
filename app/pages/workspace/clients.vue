<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Clientes"
      description="Gestiona tu cartera de clientes"
      icon="i-lucide-users"
    />
  </div>
</template>
