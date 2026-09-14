import * as Sentry from "@sentry/nuxt";

const config = useRuntimeConfig();

if (config.public.sentryDsn) {
  Sentry.init({
    dsn: config.public.sentryDsn,
    environment: import.meta.dev ? "development" : "production",
  });
}
