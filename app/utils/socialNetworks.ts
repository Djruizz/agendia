export interface SocialPlatform {
  key: string;
  name: string;
  icon: string;
  colorClass: string;
  placeholder: string;
  domains: string[];
}

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  {
    key: "instagram",
    name: "Instagram",
    icon: "i-simple-icons-instagram",
    colorClass: "text-[#E1306C]",
    placeholder: "https://instagram.com/tu_usuario",
    domains: ["instagram.com", "instagr.am"],
  },
  {
    key: "facebook",
    name: "Facebook",
    icon: "i-simple-icons-facebook",
    colorClass: "text-[#1877F2]",
    placeholder: "https://facebook.com/tu_pagina",
    domains: ["facebook.com", "fb.com", "fb.me", "fb.watch"],
  },
  {
    key: "tiktok",
    name: "TikTok",
    icon: "i-simple-icons-tiktok",
    colorClass: "text-neutral-900 dark:text-white",
    placeholder: "https://tiktok.com/@tu_usuario",
    domains: ["tiktok.com"],
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    icon: "i-simple-icons-whatsapp",
    colorClass: "text-[#25D366]",
    placeholder: "https://wa.me/521...",
    domains: ["wa.me", "whatsapp.com", "api.whatsapp.com"],
  },
  {
    key: "x",
    name: "X (Twitter)",
    icon: "i-simple-icons-x",
    colorClass: "text-neutral-900 dark:text-white",
    placeholder: "https://x.com/tu_usuario",
    domains: ["x.com", "twitter.com"],
  },
  {
    key: "youtube",
    name: "YouTube",
    icon: "i-simple-icons-youtube",
    colorClass: "text-[#FF0000]",
    placeholder: "https://youtube.com/@tu_canal",
    domains: ["youtube.com", "youtu.be"],
  },
  {
    key: "threads",
    name: "Threads",
    icon: "i-simple-icons-threads",
    colorClass: "text-neutral-900 dark:text-white",
    placeholder: "https://threads.net/@tu_usuario",
    domains: ["threads.net"],
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    icon: "i-fa6-brands-linkedin",
    colorClass: "text-[#0A66C2]",
    placeholder: "https://linkedin.com/in/tu_perfil",
    domains: ["linkedin.com"],
  },
  {
    key: "pinterest",
    name: "Pinterest",
    icon: "i-simple-icons-pinterest",
    colorClass: "text-[#BD081C]",
    placeholder: "https://pinterest.com/tu_usuario",
    domains: ["pinterest.com", "pin.it"],
  },
  {
    key: "telegram",
    name: "Telegram",
    icon: "i-simple-icons-telegram",
    colorClass: "text-[#26A5E4]",
    placeholder: "https://t.me/tu_usuario",
    domains: ["t.me", "telegram.me"],
  },
  {
    key: "twitch",
    name: "Twitch",
    icon: "i-simple-icons-twitch",
    colorClass: "text-[#9146FF]",
    placeholder: "https://twitch.tv/tu_canal",
    domains: ["twitch.tv"],
  },
  {
    key: "spotify",
    name: "Spotify",
    icon: "i-simple-icons-spotify",
    colorClass: "text-[#1DB954]",
    placeholder: "https://open.spotify.com/...",
    domains: ["spotify.com"],
  },
  {
    key: "snapchat",
    name: "Snapchat",
    icon: "i-simple-icons-snapchat",
    colorClass: "text-[#EAA800] dark:text-[#FFFC00]",
    placeholder: "https://snapchat.com/add/tu_usuario",
    domains: ["snapchat.com"],
  },
  {
    key: "other",
    name: "Sitio web / Otro",
    icon: "i-lucide-globe",
    colorClass: "text-neutral-600 dark:text-neutral-300",
    placeholder: "https://tusitio.com",
    domains: [],
  },
] as const;

/**
 * Autodetecta la red social adecuada analizando el dominio o estructura del enlace ingresado.
 */
export function detectSocialNetwork(input: string): string {
  if (!input || !input.trim()) return "other";
  const clean = input.trim().toLowerCase();

  for (const platform of SOCIAL_PLATFORMS) {
    if (platform.key === "other") continue;
    if (platform.domains.some((d) => clean.includes(d))) {
      return platform.key;
    }
  }

  return "other";
}

/**
 * Normaliza la URL agregando protocolo https:// si el usuario omitió el esquema http/https.
 */
export function normalizeSocialUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Obtiene la definición de una plataforma a partir de su clave, retornando 'other' por defecto.
 */
export function getSocialPlatform(key: string): SocialPlatform {
  const found = SOCIAL_PLATFORMS.find((p) => p.key === key);
  if (found) return found;
  return SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1] as SocialPlatform;
}
