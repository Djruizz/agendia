<script setup lang="ts">
import { COLOR_THEMES, type ColorTheme } from "~/schemas/preferences";
import { COLOR_THEME_LABELS } from "~/types/preferences";

const appConfig = useAppConfig();
const toast = useToast();

const { data: preferences } = useUserPreferences();
const updatePrefs = useUpdateUserPreferences();

const selected = computed<ColorTheme>({
  get: () =>
    preferences.value?.color_theme ??
    (appConfig.ui.colors.primary as ColorTheme),
  set: (value) => {
    const previous = appConfig.ui.colors.primary;
    appConfig.ui.colors.primary = value;
    updatePrefs.mutate(
      { color_theme: value },
      {
        onSuccess: () =>
          toast.add({
            icon: "i-lucide-check",
            title: "Tema actualizado",
            color: "success",
          }),
        onError: () => {
          appConfig.ui.colors.primary = previous;
          toast.add({
            icon: "i-lucide-x",
            title: "No se pudo guardar el tema",
            color: "error",
          });
        },
      },
    );
  },
});
const open = ref(false);
const isMobile = ref(false);

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth <= 640;
  };
  check();
  window.addEventListener("resize", check);
});
const onChange = (value: boolean) => {
  open.value = value;
};
const labelFor = (c: ColorTheme) => COLOR_THEME_LABELS[c];
</script>

<template>
  <UPopover
    :ui="{ content: 'w-80' }"
    :content="{
      align: 'center',
      side: isMobile ? 'bottom' : 'left',
      sideOffset: 8,
    }"
    @update:open="onChange"
  >
    <UButton
      variant="outline"
      color="neutral"
      aria-label="Color de la app"
      :disabled="updatePrefs.isPending.value"
      :loading="updatePrefs.isPending.value"
    >
      <span
        class="size-5 rounded-full ring-1 ring-inset ring-default"
        :style="{ backgroundColor: `var(--color-${selected}-500)` }"
      />
      <UIcon
        name="i-lucide-chevron-down"
        class="size-4 text-muted transition-transform duration-200"
        :class="{ 'rotate-180': open }"
      />
    </UButton>

    <template #content>
      <div class="p-3">
        <p class="px-1 pb-2 text-xs font-medium text-muted">Color de la app</p>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="color in COLOR_THEMES"
            :key="color"
            type="button"
            class="flex flex-col items-center gap-1.5 rounded-md p-2 transition hover:bg-elevated/50 disabled:opacity-50 disabled:hover:bg-transparent"
            :disabled="updatePrefs.isPending.value"
            @click="selected = color"
          >
            <span
              class="size-8 rounded-full ring-1 ring-inset ring-default"
              :class="selected === color && 'ring-2 ring-primary'"
              :style="{ backgroundColor: `var(--color-${color}-500)` }"
            />
            <span class="text-[11px] text-muted">{{ labelFor(color) }}</span>
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
