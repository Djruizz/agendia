import { useMutation, useQueryClient } from "@tanstack/vue-query";
export type ServiceCreateInput = Omit<ServiceInsert, "professional_id">;
export const useCreateService = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (service: ServiceCreateInput) => {
      const { error } = await supabase.from("services").insert({
        ...service,
        professional_id: user.value!.sub,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
};
