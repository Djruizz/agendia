<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps<{
  error: NuxtError;
}>();

const isNotFound = computed(() => props.error.statusCode === 404);

const statusMessage = computed(() =>
  isNotFound.value ? "Página no encontrada" : "Algo salió mal",
);

const message = computed(() =>
  isNotFound.value
    ? "La página que buscas no existe o cambió de dirección."
    : "Ocurrió un error inesperado. Inténtalo de nuevo en unos momentos.",
);

useSeoMeta({
  title: () => `${statusMessage.value} | ${SITE.name}`,
});
</script>

<template>
  <UApp>
    <UHeader :toggle="false">
      <template #title>
        <img
          src="/agendia-text-transparent.png"
          alt="Agendia"
          class="rounded-xl h-10"
        />
      </template>
      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <UContainer>
        <UError
          :error="error"
          :icon="isNotFound ? 'i-lucide-file-question' : 'i-lucide-triangle-alert'"
        >
          <template #statusMessage>{{ statusMessage }}</template>
          <template #message>{{ message }}</template>
          <template #links>
            <UButton
              size="lg"
              label="Volver al inicio"
              icon="i-lucide-house"
              @click="clearError({ redirect: '/' })"
            />
            <UButton
              size="lg"
              color="neutral"
              variant="outline"
              label="Ir a mi agenda"
              icon="i-lucide-calendar-days"
              @click="clearError({ redirect: '/workspace' })"
            />
          </template>
        </UError>
      </UContainer>
    </UMain>
  </UApp>
</template>
