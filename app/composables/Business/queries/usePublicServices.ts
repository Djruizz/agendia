import { useQuery } from "@tanstack/vue-query";

export function usePublicServices(
  professionalId: string | Ref<string | null | undefined>,
) {
  const supabase = useSupabaseClient();
  const idRef = isRef(professionalId)
    ? professionalId
    : ref(professionalId);

  return useQuery({
    queryKey: computed(() => ["public-services", idRef.value]),
    enabled: computed(() => !!idRef.value),
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("professional_id", idRef.value!)
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
