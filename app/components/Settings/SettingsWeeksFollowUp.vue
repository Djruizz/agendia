<script setup lang="ts">
import { WEEKS_FOR_REMEMBER } from "~/composables/Appointment/utils/AppointmentStatus";

const toast = useToast();

const { data: preferences } = useUserPreferences();
const updatePrefs = useUpdateUserPreferences();

const selected = computed<number>({
  get: () => preferences.value?.weeks_to_follow_up ?? WEEKS_FOR_REMEMBER,
  set: (value) => {
    if (value === preferences.value?.weeks_to_follow_up) return;
    updatePrefs.mutate(
      { weeks_to_follow_up: value },
      {
        onSuccess: () =>
          toast.add({
            icon: "i-lucide-check",
            title: "Semanas para recordar actualizado",
            color: "success",
          }),
        onError: () =>
          toast.add({
            icon: "i-lucide-x",
            title: "No se pudo guardar",
            color: "error",
          }),
      },
    );
  },
});
</script>

<template>
  <div class="flex items-center gap-2">
    <UIcon
      v-if="updatePrefs.isPending.value"
      name="i-lucide-loader-circle"
      class="animate-spin"
    />
    <UInputNumber
      v-model="selected"
      :min="1"
      :max="52"
      size="sm"
      class="w-32"
      :disabled="updatePrefs.isPending.value"
    />
  </div>
</template>
