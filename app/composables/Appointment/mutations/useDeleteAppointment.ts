import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { FriendlyError } from "~/utils/mutationErrors";

export const useDeleteAppointment = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: rows, error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
        .eq("professional_id", user.value!.sub)
        .select("id");
      if (error) throw error;
      if (!rows?.length) throw new FriendlyError("No autorizado");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
