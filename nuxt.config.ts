// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@vite-pwa/nuxt"],
  imports: {
    dirs: ["composables/**", "types/**"],
  },
  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    public: {
      locale: "es-MX",
      currency: "MXN",
    },
  },
  ssr: false,
  app: {
    head: {
      link: [
        {
          rel: "manifest",
          href: "/manifest.webmanifest",
        },
      ],
    },
  },
  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Agendia",
      short_name: "Agendia",
      description: "Agenda y administra tus citas y servicios",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/workspace",
      icons: [
        {
          src: "/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },
  css: ["assets/css/main.css"],
});
