<script setup lang="ts">
definePageMeta({
  layout: "workspace",
  middleware: "auth",
});
</script>

<template>
  <div>
    <LayoutPageHeader
      title="Calendario"
      description="Visualiza tus citas en el calendario"
      icon="i-lucide-calendar-days"
    />
  </div>
</template>
