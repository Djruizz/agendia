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
  const user = useSupabaseUser();
  return useQuery({
    queryKey: computed(() => [
      "clients",
      user.value?.sub,
      sortBy,
      asc,
      limit ?? "all",
    ]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      let query = supabase
        .from("clients")
        .select("*")
        .eq("professional_id", user.value!.sub)
        .eq("is_active", true)
        .order(sortBy, { ascending: asc });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
