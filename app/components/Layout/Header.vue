<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const supabase = useSupabaseClient();
const colorMode = useColorMode();
const { enabled: supportEnabled, reportUrl } = useSupportWhatsApp();
const { canInstall, isInstalled, isIOS, install } = usePwaInstall();

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (value) => {
    colorMode.preference = value ? "dark" : "light";
  },
});

const items = computed<DropdownMenuItem[][]>(() => {
  const mainLinks: DropdownMenuItem[] = [
    {
      label: "Mi Negocio",
      icon: "i-lucide-store",
      to: "/workspace/business",
    },
    {
      label: "Ganancias",
      icon: "i-lucide-wallet",
      to: "/workspace/earnings",
    },
    {
      label: "Configuración",
      icon: "i-lucide-settings",
      to: "/workspace/settings",
    },
  ];

  if (canInstall.value && !isInstalled.value) {
    mainLinks.push({
      label: isIOS.value ? "Cómo instalar en iPhone" : "Instalar aplicación",
      icon: "i-lucide-download",
      onSelect: () => {
        install();
      },
    });
  }

  return [
    mainLinks,
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
  ];
});
</script>

<template>
  <UHeader :toggle="false" class="sticky-top" to="/workspace">
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
        <UBadge
          color="warning"
          variant="subtle"
          label="Beta"
          class="hidden sm:inline-flex"
        />
        <UTooltip
          v-if="canInstall && !isInstalled"
          :text="
            isIOS
              ? 'Cómo instalar en iPhone / iPad'
              : 'Instalar Agendia como app'
          "
        >
          <UButton
            icon="i-lucide-download"
            color="primary"
            variant="subtle"
            size="sm"
            aria-label="Instalar Agendia como app"
            class="cursor-pointer font-medium"
            @click="install"
          >
            <span class="hidden md:inline text-xs">Instalar app</span>
          </UButton>
        </UTooltip>
        <UTooltip v-if="supportEnabled" text="Reportar problema">
          <UButton
            :to="reportUrl"
            target="_blank"
            icon="i-lucide-message-circle-warning"
            color="warning"
            variant="ghost"
            aria-label="Reportar problema"
            class="cursor-pointer"
          />
        </UTooltip>
        <UDropdownMenu :items="items" :ui="{ content: 'min-w-48' }">
          <UButton
            icon="i-lucide-menu"
            color="neutral"
            variant="ghost"
            aria-label="Menú principal"
            class="cursor-pointer"
          />
        </UDropdownMenu>
      </div>
    </template>
  </UHeader>
</template>
