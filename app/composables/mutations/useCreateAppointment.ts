import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useCreateAppointment = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();
  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const { error } = await supabase.from("appointments").insert({
        ...appointment,
        professional_id: user.value?.sub,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
