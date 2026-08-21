<script setup lang="ts">
import { TIME_FORMATS, type TimeFormat } from "~/schemas/preferences";
import { TIME_FORMAT_LABELS } from "~/types/preferences";

const toast = useToast();

const { data: preferences } = useUserPreferences();
const updatePrefs = useUpdateUserPreferences();

const DEFAULT_TIME_FORMAT: TimeFormat = "24h";

const items = computed(() =>
  TIME_FORMATS.map((value) => ({ value, label: TIME_FORMAT_LABELS[value] })),
);

const selected = computed<TimeFormat>({
  get: () => preferences.value?.time_format ?? DEFAULT_TIME_FORMAT,
  set: (value) => {
    if (value === preferences.value?.time_format) return;
    updatePrefs.mutate(
      { time_format: value },
      {
        onSuccess: () =>
          toast.add({
            icon: "i-lucide-check",
            title: "Formato de horario actualizado",
            color: "success",
          }),
        onError: () =>
          toast.add({
            icon: "i-lucide-x",
            title: "No se pudo guardar el formato",
            color: "error",
          }),
      },
    );
  },
});
</script>

<template>
  <URadioGroup
    v-model="selected"
    :items="items"
    orientation="horizontal"
    size="sm"
    variant="table"
    :disabled="updatePrefs.isPending.value"
  />
</template>