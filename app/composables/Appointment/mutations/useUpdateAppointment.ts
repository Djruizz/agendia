import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useUpdateAppointment = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (data: { id: string; appointment: AppointmentUpdate }) => {
      const { data: rows, error } = await supabase
        .from("appointments")
        .update({ ...data.appointment })
        .eq("id", data.id)
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
