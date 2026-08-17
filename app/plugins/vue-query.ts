import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

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
});
