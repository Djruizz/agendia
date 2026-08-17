<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const props = defineProps<{
  service: Service;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  edit: [service: Service];
  delete: [service: Tables<"services">];
}>();

const formattedDuration = computed(() => {
  const mins = props.service.duration_minutes ?? 0;
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}min` : `${hrs}h`;
});

const formattedPrice = computed(() => {
  const price = props.service.price ?? 0;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(price);
});

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Editar",
      icon: "i-lucide-pencil",
      onSelect: () => emit("edit", props.service),
    },
    {
      label: "Eliminar",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => emit("delete", props.service),
    },
  ],
]);
</script>

<template>
  <UCard class="overflow-hidden w-full" variant="subtle" :ui="{ body: 'p-4' }">
    <div class="flex justify-between items-center gap-4">
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <!-- <div
          class="flex items-center justify-center size-10 rounded-xl bg-primary/10 shrink-0"
        >
          <UIcon name="i-lucide-scissors" class="size-5 text-primary" />
        </div> -->

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-highlighted truncate">
            {{ service.name }}
          </p>
          <p
            v-if="service.description"
            class="text-xs text-muted mt-0.5 line-clamp-2"
          >
            {{ service.description }}
          </p>
          <div class="flex items-center gap-3 mt-2">
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clock"
                class="size-3.5 text-dimmed shrink-0"
              />
              <span class="text-xs text-muted">{{ formattedDuration }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-dollar-sign"
                class="size-3.5 text-dimmed shrink-0"
              />
              <span class="text-xs font-medium text-highlighted">{{
                formattedPrice
              }}</span>
            </div>
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
  </UCard>
</template>
