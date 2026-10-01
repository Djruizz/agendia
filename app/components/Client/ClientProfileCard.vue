<script setup lang="ts">
import type { Client } from "../../types/clients";

const props = defineProps<{
  client: Client;
}>();

const emit = defineEmits<{
  edit: [client: Client];
  delete: [client: Client];
  restore: [client: Client];
}>();

const { formatDate } = useDateUtils();

const initials = computed(() => {
  return props.client.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const isInactive = computed(() => props.client.is_active === false);

const whatsappUrl = computed(() => {
  if (!props.client.phone) return null;
  const digits = props.client.phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : null;
});

const clientSince = computed(() => {
  if (!props.client.client_since) return null;
  return formatDate(props.client.client_since, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formatPhone = (phone: string) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6, 10)}`;
  }

  return phone;
};
</script>

<template>
  <UCard variant="subtle" class="overflow-hidden">
    <div class="flex flex-col sm:flex-row gap-4 sm:items-start">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <UAvatar
          :text="initials"
          size="xl"
          class="bg-primary/10 text-primary shrink-0"
        />

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-lg font-semibold text-highlighted truncate">
              {{ client.name }}
            </p>
            <UBadge
              v-if="isInactive"
              size="sm"
              variant="subtle"
              color="neutral"
              icon="i-lucide-user-x"
              label="Inactivo"
            />
          </div>

          <div
            v-if="client.phone"
            class="flex items-center justify-start gap-3 min-w-0"
          >
            <div class="flex items-center gap-1.5 min-w-0">
              <UIcon name="i-lucide-phone" class="size-4 text-muted shrink-0" />
              <p class="text-sm text-muted truncate">
                {{ formatPhone(client.phone) }}
              </p>
            </div>
            <UButton
              v-if="whatsappUrl"
              icon="i-lucide-message-circle"
              variant="subtle"
              color="success"
              size="xs"
              label="Whatsapp"
              :aria-label="`Enviar mensaje a ${client.name}`"
              :title="`Enviar mensaje a ${client.name}`"
              target="_blank"
              :to="whatsappUrl"
            />
          </div>

          <div v-if="clientSince" class="flex items-center gap-1.5 min-w-0">
            <UIcon
              name="i-lucide-calendar-heart"
              class="size-4 text-muted shrink-0"
            />
            <p class="text-sm text-muted truncate">
              Cliente desde {{ clientSince }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="client.notes"
      class="rounded-lg bg-elevated/40 p-3 space-y-1 mt-4"
    >
      <p class="text-xs text-muted">Notas</p>
      <p class="text-sm text-highlighted whitespace-pre-wrap">
        {{ client.notes }}
      </p>
    </div>
    <template #footer>
      <div class="flex items-center justify-end gap-2 shrink-0">
        <template v-if="isInactive">
          <UButton
            label="Reactivar"
            icon="i-lucide-rotate-ccw"
            color="success"
            variant="soft"
            @click="emit('restore', client)"
          />
        </template>
        <template v-else>
          <UButton
            label="Editar"
            icon="i-lucide-pencil"
            color="neutral"
            variant="soft"
            @click="emit('edit', client)"
          />
          <UButton
            label="Eliminar"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            @click="emit('delete', client)"
          />
        </template>
      </div>
    </template>
  </UCard>
</template>
