export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser();

  if (!user.value) {
    const supabase = useSupabaseClient();
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        return navigateTo("/workspace");
      }
    } catch {
      // sin sesión, se queda en la página pública
    }
    return;
  }

  return navigateTo("/workspace");
});
