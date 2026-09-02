import { useQuery } from "@tanstack/vue-query";

export const useBusinessProfile = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["business-profile", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async (): Promise<BusinessProfile | null> => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.value!.sub)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};
