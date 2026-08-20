<template>
  <UPopover :ui="{ content: 'w-80 h-auto' }">
    <UButton
      variant="outline"
      color="neutral"
      :label="selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)"
      trailing-icon="i-lucide-chevron-down"
    />

    <template #content>
      <div class="grid grid-cols-3 gap-1 p-3">
        <UButton
          v-for="color in availableColors"
          :key="color"
          color="neutral"
          :label="color.charAt(0).toUpperCase() + color.slice(1)"
          variant="outline"
          size="xs"
          @click="
            selectedColor = color;
            appConfig.ui.colors.primary = color;
          "
        >
          <div
            class="size-2 rounded-full"
            :style="{ backgroundColor: `var(--color-${color}-500)` }"
          ></div>
          {{ color }}
        </UButton>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const availableColors = [
  "orange",
  "green",
  "blue",
  "violet",
  "pink",
  "amber",
  "yellow",
  "lime",
  "teal",
  "cyan",
  "sky",
  "indigo",
  "purple",
  "fuchsia",
  "pink",
] as const;
const selectedColor = ref(appConfig.ui.colors.primary);
</script>
