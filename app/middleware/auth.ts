export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();

  if (!user.value) {
    const supabase = useSupabaseClient();
    let hasSession = false;
    try {
      const { data } = await supabase.auth.getSession();
      hasSession = !!data.session;
    } catch {
      hasSession = false;
    }

    if (!hasSession) {
      return navigateTo({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }
  }
});
