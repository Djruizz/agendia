import { useQuery } from "@tanstack/vue-query";

export const useEarningsDataset = () => {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["appointments", "earnings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, date, price")
        .eq("status", "COMPLETED")
        .order("date", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
};
