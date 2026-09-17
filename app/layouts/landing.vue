<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items = computed<NavigationMenuItem[]>(() => [
  { label: "Features", to: "#features" },
  { label: "Página pública", to: "#pagina-publica" },
  { label: "Ganancias", to: "#ganancias" },
  { label: "FAQ", to: "#faq" },
]);
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <UHeader title="Agendia" to="/">
      <template #title>
        <img
          src="/agendia-logo-text.png"
          alt="Agendia"
          class="rounded-xl h-10"
        />
      </template>

      <UNavigationMenu :items="items" />

      <template #right>
        <UButton to="/login" icon="i-lucide-log-in" label="Entrar" />
        <UColorModeButton />
      </template>

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />
        <UButton
          to="/login"
          icon="i-lucide-log-in"
          label="Entrar"
          block
          class="mt-4"
        />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Agendia
        </p>
      </template>
      <template #right>
        <UButton
          to="/terminos"
          label="Términos"
          color="neutral"
          variant="ghost"
          size="sm"
        />
        <UButton
          to="/privacidad"
          label="Privacidad"
          color="neutral"
          variant="ghost"
          size="sm"
        />
      </template>
    </UFooter>
  </div>
</template>
