import { useQuery } from "@tanstack/vue-query";

export function useClients({
  sortBy = "name",
  asc = true,
  limit,
}: {
  sortBy?: string;
  asc?: boolean;
  limit?: number;
}) {
  const supabase = useSupabaseClient();
  return useQuery({
    queryKey: ["clients", sortBy, asc, limit ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order(sortBy, { ascending: asc });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
