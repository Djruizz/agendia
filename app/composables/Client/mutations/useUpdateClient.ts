import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useUpdateClient = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (data: { id: string; client: ClientUpdate }) => {
      const { data: rows, error } = await supabase
        .from("clients")
        .update({ ...data.client })
        .eq("id", data.id)
        .eq("professional_id", user.value!.sub)
        .select("id");
      if (error) throw error;
      if (!rows?.length) throw new Error("No autorizado");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
