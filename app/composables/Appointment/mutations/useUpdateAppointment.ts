import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useUpdateAppointment = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; appointment: AppointmentUpdate }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ ...data.appointment })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
