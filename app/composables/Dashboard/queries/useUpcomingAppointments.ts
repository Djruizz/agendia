import { useQuery } from "@tanstack/vue-query";
import type { AppointmentWithRelations } from "~/types/appointments";

const UPCOMING_LIMIT = 5;

export const useUpcomingAppointments = () => {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["appointments", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients:clients(*), services:services(*)")
        .gte("date", new Date().toISOString())
        .neq("status", "CANCELED")
        .order("date", { ascending: true })
        .limit(UPCOMING_LIMIT);

      if (error) throw error;
      return (data ?? []) as AppointmentWithRelations[];
    },
  });
};
