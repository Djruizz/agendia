import { useQuery } from "@tanstack/vue-query";
import type { AppointmentWithRelations } from "~/types/appointments";

export function useAppointments() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["appointments", "all", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients:clients(*), services:services(*)")
        .eq("professional_id", user.value!.sub)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AppointmentWithRelations[];
    },
  });
}
