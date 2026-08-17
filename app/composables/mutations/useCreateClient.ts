import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useCreateClient = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { error } = await supabase.from("clients").insert({
        ...client,
        professional_id: user.value?.sub,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
