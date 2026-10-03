import { useQuery } from "@tanstack/vue-query";

export function useServices() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const activeFilter = ref<"active" | "inactive">("active");

  const query = useQuery({
    queryKey: computed(() => [
      "services",
      user.value?.sub,
      activeFilter.value,
    ]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", user.value!.sub)
        .eq("is_active", activeFilter.value === "active")
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return {
    ...query,
    activeFilter,
  };
}

export const MAX_PUBLIC_SERVICES = 6;

export function usePublicServicesCount() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["services", "public-count", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.value!.sub)
        .eq("is_active", true)
        .eq("is_public", true);
      if (error) throw error;
      return count ?? 0;
    },
  });
}
