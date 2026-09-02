export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  if (!user.value) return;

  const queryClient = useNuxtApp().$queryClient;
  const key = ["business-profile", user.value.sub];

  let profile = queryClient.getQueryData<BusinessProfile | null>(key);

  if (profile === undefined) {
    try {
      const supabase = useSupabaseClient();
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.value.sub)
        .maybeSingle();
      if (error) return;
      profile = data ?? null;
      queryClient.setQueryData(key, profile);
    } catch {
      return;
    }
  }

  if (!profile) {
    const redirect = to.fullPath !== "/workspace" ? to.fullPath : undefined;
    return navigateTo({
      path: "/onboarding",
      query: redirect ? { redirect } : undefined,
    });
  }
});