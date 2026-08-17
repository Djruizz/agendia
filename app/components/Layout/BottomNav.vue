<script setup lang="ts">
const route = useRoute();

const items = [
  { label: "Servicios", icon: "i-lucide-scissors", to: "/workspace/services" },
  { label: "Clientes", icon: "i-lucide-users", to: "/workspace/clients" },
  { label: "Inicio", icon: "i-lucide-home", to: "/workspace" },
  {
    label: "Calendario",
    icon: "i-lucide-calendar-days",
    to: "/workspace/calendar",
  },
  {
    label: "Citas",
    icon: "i-lucide-calendar-check",
    to: "/workspace/appointments",
  },
];

function isActive(to: string) {
  return route.fullPath === to;
}
</script>

<template>
  <nav
    class="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-4/5 sm:max-w-xl z-40 flex items-center justify-around gap-1 h-16 p-1.5 rounded-2xl bg-elevated/80 backdrop-blur-lg border border-default/60 shadow-lg shadow-black/5 supports-backdrop-filter:bg-elevated/65 safe-area-bottom"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      :class="
        isActive(item.to)
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:text-default hover:bg-accented'
      "
    >
      <UIcon
        :name="item.icon"
        class="size-5 transition-transform duration-200"
        :class="isActive(item.to) ? 'scale-110' : ''"
      />
      <span class="text-[11px] font-medium leading-none">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  margin-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
