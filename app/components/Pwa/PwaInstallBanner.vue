<script setup lang="ts">
const { showFloatingPrompt, install, dismissPrompt, isIOS, isMobile } =
  usePwaInstall();

// Retraso suave para que la interfaz cargue primero sin interrupciones
const isVisible = ref(false);

onMounted(() => {
  if (showFloatingPrompt.value) {
    const timer = setTimeout(() => {
      isVisible.value = true;
    }, 2500);

    onUnmounted(() => clearTimeout(timer));
  }
});

watch(showFloatingPrompt, (val) => {
  if (!val) {
    isVisible.value = false;
  }
});

async function handleInstall() {
  await install();
}

function handleDismiss() {
  isVisible.value = false;
  dismissPrompt();
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-6 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-6 opacity-0 scale-95"
  >
    <div
      v-if="isVisible"
      class="fixed z-30 bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 max-w-sm mx-auto pointer-events-auto"
      role="alert"
      aria-live="polite"
    >
      <div
        class="relative overflow-hidden rounded-2xl p-4 bg-elevated/95 backdrop-blur-xl border border-default shadow-2xl shadow-black/10 ring-1 ring-white/10"
      >
        <div class="flex items-start gap-3">
          <div
            class="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-xs"
          >
            <img
              src="/icon-192x192.png"
              alt="Agendia"
              class="size-9 rounded-lg object-contain"
            />
          </div>

          <div class="min-w-0 flex-1 pr-1">
            <div class="flex items-center gap-1.5">
              <h3 class="text-sm font-semibold text-highlighted">
                Instalar Agendia
              </h3>
              <UBadge
                color="primary"
                variant="subtle"
                size="xs"
                :label="isMobile ? 'App móvil' : 'App escritorio'"
              />
            </div>
            <p class="text-xs text-muted mt-0.5 leading-relaxed">
              {{
                isMobile
                  ? "Agrégala a tu pantalla de inicio para acceder en 1 toque y usarla a pantalla completa."
                  : "Instálala en tu computadora para abrirla en su propia ventana desde la barra de tareas o el Dock."
              }}
            </p>
          </div>

          <button
            type="button"
            class="text-muted hover:text-highlighted p-1 rounded-lg hover:bg-accented transition-colors cursor-pointer"
            aria-label="Cerrar aviso de instalación"
            @click="handleDismiss"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <div class="mt-3.5 flex items-center gap-2">
          <UButton
            icon="i-lucide-download"
            color="primary"
            variant="solid"
            size="sm"
            class="flex-1 justify-center cursor-pointer font-medium"
            :label="
              isIOS
                ? 'Cómo instalar'
                : isMobile
                ? 'Instalar app'
                : 'Instalar en tu PC / Mac'
            "
            @click="handleInstall"
          />
          <UButton
            label="Ahora no"
            color="neutral"
            variant="ghost"
            size="sm"
            class="cursor-pointer text-muted hover:text-default"
            @click="handleDismiss"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>
