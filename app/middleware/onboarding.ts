export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  if (!user.value) return;

  const queryClient = useNuxtApp().$queryClient;
  const key = ["business-profile", user.value.sub];

  let profile = queryClient.getQueryData<BusinessProfile | null>(key);

  if (profile === undefined) {
    const supabase = useSupabaseClient();
    let data: BusinessProfile | null = null;
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      try {
        const res = await supabase
          .from("business_profiles")
          .select("*")
          .eq("user_id", user.value.sub)
          .maybeSingle();
        if (!res.error) {
          data = res.data ?? null;
          lastError = undefined;
          break;
        }
        lastError = res.error;
      } catch (e) {
        lastError = e;
      }
    }

    // Fail-closed: sin verificación confiable no se entra al workspace.
    if (lastError !== undefined) {
      throw createError({
        statusCode: 503,
        statusMessage: "No pudimos verificar tu perfil de negocio",
        message:
          "Revisa tu conexión e inténtalo de nuevo en unos momentos.",
        fatal: true,
      });
    }

    profile = data;
    queryClient.setQueryData(key, profile);
  }

  if (!profile) {
    const redirect = to.fullPath !== "/workspace" ? to.fullPath : undefined;
    return navigateTo({
      path: "/onboarding",
      query: redirect ? { redirect } : undefined,
    });
  }
});
