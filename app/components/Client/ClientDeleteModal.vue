<script setup lang="ts">
import { type Client } from "~/types/clients";
const props = defineProps<{
  client?: Client;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: deleteClient, isPending: deleting } = useDeleteClient();
const toast = useToast();

async function onConfirm() {
  if (!props.client) return;
  try {
    await deleteClient(props.client.id);
    toast.add({
      title: "Cliente eliminado",
      description: `${props.client.name} fue eliminado`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Eliminar cliente"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div
          class="flex items-center justify-center size-16 rounded-full bg-error/10"
        >
          <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
        </div>

        <div class="space-y-2">
          <p class="text-base font-semibold text-highlighted">
            ¿Estás seguro de eliminar este cliente?
          </p>
          <p class="text-sm text-muted max-w-sm">
            El cliente se marcará como inactivo y dejará de aparecer en la
            lista. Podrás restaurarlo más tarde.
          </p>
        </div>

        <div v-if="client" class="w-full text-start">
          <ClientCard :client="client" />
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        label="Eliminar"
        color="error"
        icon="i-lucide-trash-2"
        :loading="deleting"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>
