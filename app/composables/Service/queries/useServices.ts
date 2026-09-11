import { useQuery } from "@tanstack/vue-query";

export function useServices() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  return useQuery({
    queryKey: computed(() => ["services", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", user.value!.sub)
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
