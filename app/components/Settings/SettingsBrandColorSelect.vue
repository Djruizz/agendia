<script setup lang="ts">
import { COLOR_THEMES, type ColorTheme } from "~/schemas/preferences";

const DEFAULT_BRAND_COLOR: ColorTheme = "pink";

const toast = useToast();

const { data: profile } = useBusinessProfile();
const updateProfile = useUpdateBusinessProfile();

const open = ref(false);
const isMobile = ref(false);

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth <= 640;
  };
  check();
  window.addEventListener("resize", check);
});

onUnmounted(() => {
  window.removeEventListener("resize", () => {});
});

const onChange = (value: boolean) => {
  open.value = value;
};

const selected = computed<ColorTheme>({
  get: () => {
    const raw = (profile.value as unknown as { brand_color?: string | null })
      ?.brand_color;
    return COLOR_THEMES.includes(raw as ColorTheme)
      ? (raw as ColorTheme)
      : DEFAULT_BRAND_COLOR;
  },
  set: (value) => {
    if (value === selected.value) return;
    updateProfile.mutate(
      { brand_color: value },
      {
        onSuccess: () =>
          toast.add({
            icon: "i-lucide-check",
            title: "Color de la página actualizado",
            color: "success",
          }),
        onError: () =>
          toast.add({
            icon: "i-lucide-x",
            title: "No se pudo guardar el color",
            color: "error",
          }),
      },
    );
  },
});
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
      aria-label="Color de la página"
      :disabled="updateProfile.isPending.value"
      :loading="updateProfile.isPending.value"
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
        <p class="px-1 pb-2 text-xs font-medium text-muted">
          Color de tu página pública
        </p>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="color in COLOR_THEMES"
            :key="color"
            type="button"
            class="flex flex-col items-center gap-1.5 rounded-md p-2 transition hover:bg-elevated/50 disabled:opacity-50 disabled:hover:bg-transparent"
            :disabled="updateProfile.isPending.value"
            @click="selected = color"
          >
            <span
              class="size-8 rounded-full ring-1 ring-inset ring-default"
              :class="selected === color && 'ring-2 ring-primary'"
              :style="{ backgroundColor: `var(--color-${color}-500)` }"
            />
            <span class="text-[11px] text-muted">{{ color }}</span>
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>