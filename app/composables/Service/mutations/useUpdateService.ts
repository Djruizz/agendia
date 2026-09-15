import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { FriendlyError } from "~/utils/mutationErrors";
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
      if (!rows?.length) throw new FriendlyError("No autorizado");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["public-services"] });
    },
  });
};
