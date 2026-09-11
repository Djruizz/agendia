import { useQuery } from "@tanstack/vue-query";
import type { AppointmentWithRelations } from "~/types/appointments";

const UPCOMING_LIMIT = 5;

export const useUpcomingAppointments = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["appointments", "upcoming", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients:clients(*), services:services(*)")
        .eq("professional_id", user.value!.sub)
        .gte("date", new Date().toISOString())
        .neq("status", "CANCELED")
        .order("date", { ascending: true })
        .limit(UPCOMING_LIMIT);

      if (error) throw error;
      return (data ?? []) as AppointmentWithRelations[];
    },
  });
};
