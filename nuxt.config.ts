// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@vite-pwa/nuxt", "@sentry/nuxt"],
  sentry: {
    sourcemaps: {
      disable: true,
    },
  },
  imports: {
    dirs: ["composables/**", "types/**"],
  },
  // Lucide se resuelve localmente vía @iconify-json/lucide: sin fetch a
  // api.iconify.design en dev/build/SSR (determinístico, iconos embebidos
  // en el prerender y sin mismatch de hidratación).
  icon: {
    serverBundle: {
      collections: ["lucide"],
    },
  },
  supabase: {
    redirect: false,
  },
  runtimeConfig: {
    public: {
      locale: "es-MX",
      currency: "MXN",
      sentryDsn: "",
    },
  },
  ssr: true,
  // Híbrido: "/", "/terminos" y "/privacidad" se prerenderizan con HTML
  // completo (SEO/og tags para WhatsApp); el resto de la app sigue siendo
  // SPA. El hook evita que el crawler de prerender siga links hacia rutas
  // del SPA (auth, onboarding, workspace, /p/**).
  routeRules: {
    "/": { ssr: true, prerender: true },
    "/terminos": { ssr: true, prerender: true },
    "/privacidad": { ssr: true, prerender: true },
    "/**": { ssr: false },
  },
  hooks: {
    "prerender:routes"({ routes }) {
      routes.clear();
      routes.add("/");
      routes.add("/terminos");
      routes.add("/privacidad");
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/agendia-no-bg.png",
        },
        {
          rel: "shortcut icon",
          type: "image/png",
          href: "/agendia-no-bg.png",
        },
        {
          rel: "apple-touch-icon",
          type: "image/png",
          href: "/icon-192x192.png",
        },
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
