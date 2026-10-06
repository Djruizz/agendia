import { ref, computed } from "vue";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Estado reactivo singleton a nivel módulo
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstalled = ref(false);
const isIOS = ref(false);
const isSafari = ref(false);
const isMobile = ref(false);
const isMacSafari = ref(false);
const isDismissed = ref(false);
const showIOSModal = ref(false);
const isInitialized = ref(false);

const DISMISS_KEY = "agendia:pwa-prompt-dismissed-at";
const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 días

function checkStandalone(): boolean {
  if (!import.meta.client) return false;
  const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const isIOSStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(isStandaloneMedia || isIOSStandalone);
}

function checkIOS(): boolean {
  if (!import.meta.client) return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

function checkSafari(): boolean {
  if (!import.meta.client) return false;
  const ua = navigator.userAgent;
  return checkIOS() && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
}

function checkMobile(): boolean {
  if (!import.meta.client) return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function checkMacSafari(): boolean {
  if (!import.meta.client) return false;
  const ua = navigator.userAgent;
  const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(ua) && !checkIOS();
  return isMac && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/i.test(ua);
}

function checkDismissed(): boolean {
  if (!import.meta.client) return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const timestamp = parseInt(raw, 10);
    if (isNaN(timestamp)) return false;
    return Date.now() - timestamp < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

export function initPwaListeners(): void {
  if (!import.meta.client || isInitialized.value) return;
  isInitialized.value = true;

  isInstalled.value = checkStandalone();
  isIOS.value = checkIOS();
  isSafari.value = checkSafari();
  isMobile.value = checkMobile();
  isMacSafari.value = checkMacSafari();
  isDismissed.value = checkDismissed();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt.value = e as BeforeInstallPromptEvent;
  });

  window.addEventListener("appinstalled", () => {
    isInstalled.value = true;
    deferredPrompt.value = null;
  });

  if (window.matchMedia) {
    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", (e) => {
      if (e.matches) {
        isInstalled.value = true;
        deferredPrompt.value = null;
      }
    });
  }
}

export function usePwaInstall() {
  if (import.meta.client && !isInitialized.value) {
    initPwaListeners();
  }

  const canInstall = computed(() => {
    if (isInstalled.value) return false;
    // Navegadores basados en Chromium con evento disponible O iOS Safari donde el usuario puede añadir al inicio
    return deferredPrompt.value !== null || isIOS.value;
  });

  const showFloatingPrompt = computed(() => {
    return canInstall.value && !isDismissed.value;
  });

  async function install(): Promise<"accepted" | "dismissed" | "ios_instructions"> {
    if (isIOS.value) {
      showIOSModal.value = true;
      return "ios_instructions";
    }

    if (!deferredPrompt.value) {
      return "dismissed";
    }

    try {
      const promptEvent = deferredPrompt.value;
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        isInstalled.value = true;
        deferredPrompt.value = null;
      }
      return choice.outcome;
    } catch (err) {
      console.error("Error al iniciar instalación de PWA:", err);
      return "dismissed";
    }
  }

  function dismissPrompt(): void {
    isDismissed.value = true;
    if (import.meta.client) {
      try {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      } catch {
        // Ignora errores si el storage está restringido
      }
    }
  }

  function resetDismissed(): void {
    isDismissed.value = false;
    if (import.meta.client) {
      try {
        localStorage.removeItem(DISMISS_KEY);
      } catch {
        // Ignora errores
      }
    }
  }

  return {
    deferredPrompt,
    isInstalled,
    isIOS,
    isSafari,
    isMobile,
    isMacSafari,
    isDismissed,
    showIOSModal,
    canInstall,
    showFloatingPrompt,
    install,
    dismissPrompt,
    resetDismissed,
  };
}
