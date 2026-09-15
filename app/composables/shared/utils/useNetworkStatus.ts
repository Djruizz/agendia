// Estado de red compartido (module-level): un solo set de listeners para toda
// la app. `useNetworkStatus()` es idempotente — puede llamarse desde cualquier
// layout/composable sin duplicar listeners.
const isOnline = ref(true);
let listenersBound = false;

export const useNetworkStatus = () => {
  if (import.meta.client && !listenersBound) {
    listenersBound = true;
    isOnline.value = navigator.onLine;
    window.addEventListener("online", () => {
      isOnline.value = true;
    });
    window.addEventListener("offline", () => {
      isOnline.value = false;
    });
  }

  return { isOnline };
};
