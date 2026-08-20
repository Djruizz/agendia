import { useQuery } from "@tanstack/vue-query";
import { UserPreferencesSchema, type UserPreferencesSettings } from "~/schemas/preferences";

export const useUserPreferences = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => ["user-preferences", user.value?.sub]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async (): Promise<UserPreferencesSettings> => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("settings")
        .eq("user_id", user.value!.sub)
        .maybeSingle();

      if (error) throw error;
      return UserPreferencesSchema.parse(data?.settings ?? {});
    },
  });
};