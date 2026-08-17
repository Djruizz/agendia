import { useQuery } from "@tanstack/vue-query";
import type { AppointmentWithRelations } from "~/types/appointments";

export function useAppointments() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients:clients(*), services:services(*)")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AppointmentWithRelations[];
    },
  });
}
