<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const supabase = useSupabaseClient();
const colorMode = useColorMode();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (value) => {
    colorMode.preference = value ? "dark" : "light";
  },
});

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Configuración",
      icon: "i-lucide-settings",
      to: "/workspace/settings",
    },
  ],
  [
    {
      label: "Cerrar sesión",
      icon: "i-lucide-log-out",
      color: "error",
      onSelect: async () => {
        await supabase.auth.signOut();
        await navigateTo("/login", { external: true });
      },
    },
  ],
]);
</script>

<template>
  <UHeader :toggle="false" class="sticky-top">
    <template #title>
      <div class="px-2 py-1 rounded-xl">
        <img
          src="/agendia-logo-text.png"
          alt="Agendia Logo"
          class="rounded-xl h-10"
        />
      </div>
    </template>
    <template #right>
      <div class="flex items-center gap-1">
        <UTooltip text="Ganancias">
          <UButton
            to="/workspace/earnings"
            icon="i-lucide-wallet"
            color="neutral"
            variant="ghost"
            aria-label="Ganancias"
            class="cursor-pointer"
          />
        </UTooltip>
        <UDropdownMenu :items="items" :ui="{ content: 'min-w-48' }">
          <UButton
            icon="i-lucide-settings"
            color="neutral"
            variant="ghost"
            class="cursor-pointer"
          />
        </UDropdownMenu>
      </div>
    </template>
  </UHeader>
</template>
