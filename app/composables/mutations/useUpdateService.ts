import { useMutation, useQueryClient } from "@tanstack/vue-query";
export const useUpdateService = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; service: ServiceUpdate }) => {
      const { error } = await supabase
        .from("services")
        .update({
          ...data.service,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
