import { useQuery } from "@tanstack/vue-query";

export function useClient(id: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const clientId = toRef(id);
  return useQuery({
    queryKey: computed(() => ["clients", "detail", user.value?.sub, clientId.value]),
    enabled: computed(() => !!user.value?.sub && !!clientId.value),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("professional_id", user.value!.sub)
        .eq("id", clientId.value)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
