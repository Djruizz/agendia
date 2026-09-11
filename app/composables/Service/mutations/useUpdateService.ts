import { useMutation, useQueryClient } from "@tanstack/vue-query";
export const useUpdateService = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (data: { id: string; service: ServiceUpdate }) => {
      const { data: rows, error } = await supabase
        .from("services")
        .update({
          ...data.service,
        })
        .eq("id", data.id)
        .eq("professional_id", user.value!.sub)
        .select("id");
      if (error) throw error;
      if (!rows?.length) throw new Error("No autorizado");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
