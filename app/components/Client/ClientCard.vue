<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { Client } from "../../types/clients";

const props = defineProps<{
  client: Client;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  edit: [client: Client];
  delete: [client: Client];
}>();

const initials = computed(() => {
  return props.client.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Editar",
      icon: "i-lucide-pencil",
      onSelect: () => emit("edit", props.client),
    },
    {
      label: "Eliminar",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => emit("delete", props.client),
    },
  ],
]);
</script>

<template>
  <UCard class="overflow-hidden w-full" variant="subtle" :ui="{ body: 'p-4' }">
    <div class="flex justify-between items-center gap-4">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <UAvatar
          :text="initials"
          size="md"
          class="bg-primary/10 text-primary shrink-0"
        />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-highlighted truncate">
            {{ client.name }}
          </p>
          <div
            v-if="client.phone"
            class="flex items-center gap-1.5 mt-0.5 min-w-0"
          >
            <UIcon name="i-lucide-phone" class="size-3.5 text-muted shrink-0" />
            <p class="text-sm text-muted truncate">
              {{ client.phone }}
            </p>
          </div>
        </div>
      </div>
      <UDropdownMenu v-if="showActions" :items="items">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          size="sm"
          variant="link"
          color="neutral"
          class="cursor-pointer shrink-0"
        />
      </UDropdownMenu>
    </div>

    <!-- <p v-if="client.notes" class="mt-3 text-sm text-dimmed line-clamp-2">
      {{ client.notes }}
    </p> -->
  </UCard>
</template>
