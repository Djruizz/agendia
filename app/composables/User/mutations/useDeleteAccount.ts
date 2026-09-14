import { useMutation } from "@tanstack/vue-query";

export const useDeleteAccount = () => {
  const supabase = useSupabaseClient();
  const config = useRuntimeConfig().public.supabase;

  return useMutation({
    mutationFn: async (password: string) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
      }

      const res = await fetch(`${config.url}/functions/v1/delete-account`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: config.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const body = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(body?.error ?? "No se pudo eliminar la cuenta");
      }
    },
  });
};
