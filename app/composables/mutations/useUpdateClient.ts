import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useUpdateClient = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; client: ClientUpdate }) => {
      const { error } = await supabase
        .from("clients")
        .update({ ...data.client })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
