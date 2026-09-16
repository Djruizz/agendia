<script setup lang="ts">
useApplyUserPreferences();

const { isOnline } = useNetworkStatus();
const toast = useToast();

// Aviso persistente de offline (PWA): avisa antes de que fallen queries o
// mutaciones por red. Complementa los QueryErrorState de cada vista.
watch(
  isOnline,
  (online, wasOffline) => {
    if (!online) {
      toast.add({
        id: "offline",
        title: "Sin conexión",
        description:
          "No podrás guardar cambios hasta que vuelva la conexión. Tus datos ya guardados siguen disponibles.",
        icon: "i-lucide-wifi-off",
        color: "warning",
        duration: Infinity,
      });
    } else if (wasOffline === false) {
      toast.remove("offline");
      toast.add({
        title: "Conexión restablecida",
        icon: "i-lucide-wifi",
        color: "success",
      });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="min-h-dvh">
    <LayoutHeader />

    <UMain class="min-w-0 pb-20">
      <UContainer class="py-4 min-w-0 max-w-full">
        <div class="min-w-0 max-w-full overflow-hidden">
          <slot />
        </div>
      </UContainer>
    </UMain>

    <LayoutBottomNav />
  </div>
</template>