import { useQuery } from "@tanstack/vue-query";

export function usePublicBusiness(slug: string | Ref<string>) {
  const supabase = useSupabaseClient();
  const slugRef = isRef(slug) ? slug : ref(slug);

  return useQuery({
    queryKey: computed(() => ["public-business", slugRef.value]),
    queryFn: async (): Promise<BusinessProfile | null> => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("slug", slugRef.value)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
