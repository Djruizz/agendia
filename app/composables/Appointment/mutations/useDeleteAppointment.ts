import { useMutation, useQueryClient } from "@tanstack/vue-query";

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
      if (!rows?.length) throw new Error("No autorizado");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
