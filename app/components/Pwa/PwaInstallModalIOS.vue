<script setup lang="ts">
const { showIOSModal } = usePwaInstall();
</script>

<template>
  <UModal
    v-model:open="showIOSModal"
    title="Instalar Agendia en iPhone o iPad"
    description="Sigue estos sencillos pasos desde Safari para tener Agendia en tu pantalla de inicio:"
  >
    <template #body>
      <div class="space-y-3 py-1">
        <div
          class="flex items-start gap-3 p-3 rounded-xl bg-accented/60 border border-default/60"
        >
          <div
            class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs"
          >
            <UIcon name="i-lucide-share" class="size-4" />
          </div>
          <div class="min-w-0 text-xs">
            <p class="font-semibold text-highlighted">1. Toca "Compartir"</p>
            <p class="text-muted mt-0.5">
              En la barra inferior de Safari, pulsa el botón de compartir (el cuadrado con la flecha hacia arriba).
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 p-3 rounded-xl bg-accented/60 border border-default/60"
        >
          <div
            class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs"
          >
            <UIcon name="i-lucide-plus-square" class="size-4" />
          </div>
          <div class="min-w-0 text-xs">
            <p class="font-semibold text-highlighted">
              2. "Agregar a pantalla de inicio"
            </p>
            <p class="text-muted mt-0.5">
              Desliza las opciones hacia abajo y pulsa en <strong>Agregar a pantalla de inicio</strong>.
            </p>
          </div>
        </div>

        <div
          class="flex items-start gap-3 p-3 rounded-xl bg-accented/60 border border-default/60"
        >
          <div
            class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs"
          >
            <UIcon name="i-lucide-check" class="size-4" />
          </div>
          <div class="min-w-0 text-xs">
            <p class="font-semibold text-highlighted">3. Toca "Agregar"</p>
            <p class="text-muted mt-0.5">
              Confirma en la esquina superior derecha. ¡Listo! Agendia aparecerá como una app en tu pantalla.
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UButton
        label="¡Entendido!"
        color="primary"
        block
        class="cursor-pointer font-medium"
        @click="showIOSModal = false"
      />
    </template>
  </UModal>
</template>
