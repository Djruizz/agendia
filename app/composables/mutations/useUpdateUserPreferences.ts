import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Json } from "~/types/database.types";
import {
  UserPreferencesSchema,
  type UserPreferencesSettings,
} from "~/schemas/preferences";

export const useUpdateUserPreferences = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();

  return useMutation({
    mutationFn: async (patch: Partial<UserPreferencesSettings>) => {
      const queryKey = ["user-preferences", user.value?.sub];
      const current = queryClient.getQueryData<UserPreferencesSettings>(queryKey);

      const merged = UserPreferencesSchema.parse({ ...current, ...patch });

      const { data, error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.value!.sub,
          settings: merged as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .select("settings")
        .single();

      if (error) throw error;
      return UserPreferencesSchema.parse(data.settings);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-preferences", user.value?.sub], data);
    },
  });
};