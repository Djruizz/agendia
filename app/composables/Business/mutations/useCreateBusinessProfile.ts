import { useMutation, useQueryClient } from "@tanstack/vue-query";

export type BusinessProfileCreateInput = Omit<BusinessProfileInsert, "user_id">;

export const useCreateBusinessProfile = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();

  return useMutation({
    mutationFn: async (profile: BusinessProfileCreateInput): Promise<BusinessProfile> => {
      const { data, error } = await supabase
        .from("business_profiles")
        .insert({
          ...profile,
          user_id: user.value!.sub,
          slug: profile.slug.toLowerCase().trim(),
        })
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ese enlace público ya está ocupado, prueba con otro.");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["business-profile", user.value!.sub], data);
    },
  });
};
