import { useQuery } from "@tanstack/vue-query";

export const useTotalClients = () => {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: ["clients", "count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      if (error) throw error;
      return count ?? 0;
    },
  });
};