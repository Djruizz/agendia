import { useMutation, useQueryClient } from "@tanstack/vue-query";
import type { Json } from "~/types/database.types";
import {
  UserPreferencesSchema,
  type UserPreferencesSettings,
} from "~/schemas/preferences";

// Cola a nivel módulo: serializa saves concurrentes de preferencias. Cada save
// hace merge sobre el resultado del anterior (no sobre una cache potencialmente
// desactualizada), así dos campos salvados a la vez no se pisan entre sí.
let preferencesSaveQueue: Promise<UserPreferencesSettings | undefined> =
  Promise.resolve(undefined);

export const useUpdateUserPreferences = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const user = useSupabaseUser();

  return useMutation({
    mutationFn: (patch: Partial<UserPreferencesSettings>) => {
      const task = preferencesSaveQueue.then(async (previous) => {
        const queryKey = ["user-preferences", user.value?.sub];
        const current =
          previous ??
          queryClient.getQueryData<UserPreferencesSettings>(queryKey);

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
      });
      // La cola continúa aunque un save falle; el error se devuelve al caller.
      preferencesSaveQueue = task.catch(() => undefined);
      return task;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-preferences", user.value?.sub], data);
    },
  });
};
