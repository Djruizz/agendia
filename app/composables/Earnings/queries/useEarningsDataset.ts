import { useQuery } from "@tanstack/vue-query";

export const useEarningsDataset = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["appointments", "earnings", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, date, price")
        .eq("professional_id", user.value!.sub)
        .eq("status", "COMPLETED")
        .order("date", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
};
