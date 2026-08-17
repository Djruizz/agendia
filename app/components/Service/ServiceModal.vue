<script setup lang="ts">
import type { ServiceSchema } from "~/schemas/services";

const props = defineProps<{
  mode?: "create" | "edit";
  service?: Service;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: createService, isPending: creating } = useCreateService();
const { mutateAsync: updateService, isPending: updating } = useUpdateService();
const toast = useToast();

const saving = computed(() => creating.value || updating.value);

async function onSubmit(payload: ServiceSchema) {
  try {
    if (props.mode === "edit" && props.service) {
      await updateService({ id: props.service.id, service: payload });
      toast.add({
        title: "Servicio actualizado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      await createService(payload);
      toast.add({
        title: "Servicio creado",
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
    :title="mode === 'edit' ? 'Editar servicio' : 'Nuevo servicio'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <ServiceForm :service="service" @submit="onSubmit" />
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
        form="service-form"
        label="Guardar"
        color="primary"
        :loading="saving"
      />
    </template>
  </UModal>
</template>
