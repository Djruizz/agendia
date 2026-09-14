import { useQuery } from "@tanstack/vue-query";

export const useTotalServices = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["services", "count", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.value!.sub)
        .eq("is_active", true);

      if (error) throw error;
      return count ?? 0;
    },
  });
};
