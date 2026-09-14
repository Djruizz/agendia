import { useQuery } from "@tanstack/vue-query";

export const useTotalAppointments = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["appointments", "count", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.value!.sub);

      if (error) throw error;
      return count ?? 0;
    },
  });
};
