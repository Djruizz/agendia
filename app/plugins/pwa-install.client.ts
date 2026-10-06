import { initPwaListeners } from "~/composables/shared/utils/usePwaInstall";

export default defineNuxtPlugin(() => {
  initPwaListeners();
});
