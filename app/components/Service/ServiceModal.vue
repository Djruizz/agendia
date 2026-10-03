<script setup lang="ts">
import type { ServiceSchema } from "~/schemas/services";

const props = defineProps<{
  mode?: "create" | "edit";
  service?: Service;
}>();

const open = defineModel<boolean>("open", { default: false });

const { mutateAsync: createService, isPending: creating } = useCreateService();
const { mutateAsync: updateService, isPending: updating } = useUpdateService();
const removeImage = useRemoveServiceImage();
const toast = useToast();

const formRef = ref<{ cleanupUnsaved?: () => void } | null>(null);
const saving = computed(() => creating.value || updating.value);
const submitted = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    submitted.value = false;
  } else {
    // Si se cierra sin haber completado submit, limpiar fotos temporales
    if (!submitted.value) {
      formRef.value?.cleanupUnsaved?.();
    }
  }
});

async function onSubmit(payload: ServiceSchema) {
  try {
    const previousImagePath = props.service?.image_path;

    if (props.mode === "edit" && props.service) {
      await updateService({ id: props.service.id, service: payload });

      // Si la imagen fue cambiada o eliminada, borrar la foto vieja del storage
      if (previousImagePath && previousImagePath !== payload.image_path) {
        await removeImage.mutateAsync(previousImagePath).catch(() => {});
      }

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

    submitted.value = true;
    open.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: describeMutationError(err),
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

function handleClose() {
  formRef.value?.cleanupUnsaved?.();
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="mode === 'edit' ? 'Editar servicio' : 'Nuevo servicio'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <ServiceForm ref="formRef" :service="service" @submit="onSubmit" @cancel="handleClose" />
    </template>

    <template #footer>
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="handleClose"
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
