<script setup lang="ts">
import type { ClientSchema } from "~/schemas/clients";
import type { Client } from "~/types/clients";

const props = defineProps<{
  mode?: "create" | "edit";
  client?: Client;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: createClient, isPending: creating } = useCreateClient();
const { mutateAsync: updateClient, isPending: updating } = useUpdateClient();
const toast = useToast();

const saving = computed(() => creating.value || updating.value);

async function onSubmit(payload: ClientSchema) {
  try {
    if (props.mode === "edit" && props.client) {
      await updateClient({ id: props.client.id, client: payload });
      toast.add({
        title: "Cliente actualizado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      await createClient(payload);
      toast.add({
        title: "Cliente creado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
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
    :title="mode === 'edit' ? 'Editar cliente' : 'Nuevo cliente'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <ClientForm :client="client" @submit="onSubmit" />
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        type="submit"
        form="client-form"
        label="Guardar"
        color="primary"
        :loading="saving"
      />
    </template>
  </UModal>
</template>
