import { VueQueryPlugin, QueryClient, type QueryClient as QueryClientType } from "@tanstack/vue-query";

declare module "#app" {
  interface NuxtApp {
    $queryClient: QueryClientType;
  }
}

export default defineNuxtPlugin((nuxt) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    },
  });

  nuxt.vueApp.use(VueQueryPlugin, { queryClient });
  nuxt.provide("queryClient", queryClient);
});
