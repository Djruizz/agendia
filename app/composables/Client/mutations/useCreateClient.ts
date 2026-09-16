import { useMutation, useQueryClient } from "@tanstack/vue-query";

export type ClientCreateInput = Omit<ClientInsert, "professional_id">;

export const useCreateClient = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (client: ClientCreateInput) => {
      const { error } = await supabase.from("clients").insert({
        ...client,
        professional_id: user.value!.sub,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};
