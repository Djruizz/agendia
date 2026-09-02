import { useMutation, useQueryClient } from "@tanstack/vue-query";

export const useUpdateBusinessProfile = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();

  return useMutation({
    mutationFn: async (profile: BusinessProfileUpdate): Promise<BusinessProfile> => {
      const payload: BusinessProfileUpdate = {
        ...profile,
        updated_at: new Date().toISOString(),
      };
      if (typeof payload.slug === "string") {
        payload.slug = payload.slug.toLowerCase().trim();
      }

      const { data, error } = await supabase
        .from("business_profiles")
        .update(payload)
        .eq("user_id", user.value!.sub)
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ese enlace público ya está ocupado, probá con otro.");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["business-profile", user.value?.sub], data);
    },
  });
};
