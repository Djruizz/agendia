<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Client } from "../../types/clients";
import { clientSchema, type ClientSchema } from "~/schemas/clients";

const props = defineProps<{
  client?: Client;
}>();

const emit = defineEmits<{
  submit: [payload: ClientSchema];
  cancel: [];
}>();

const state = reactive<ClientSchema>({
  name: "",
  phone: "",
  notes: "",
});

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

watch(
  () => props.client,
  (val) => {
    state.name = val?.name ?? "";
    state.phone = val?.phone ?? "";
    state.notes = val?.notes ?? "";
    formRef.value?.clearErrors();
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<ClientSchema>) {
  emit("submit", {
    name: event.data.name.trim(),
    phone: event.data.phone.trim(),
    notes: event.data.notes?.trim() || undefined,
  });
}
</script>

<template>
  <UForm
    id="client-form"
    ref="formRef"
    :schema="clientSchema"
    :state="state"
    class="grid grid-cols-2 gap-4"
    @submit="onSubmit"
  >
    <UFormField name="name" label="Nombre" required class="col-span-2">
      <UInput
        v-model="state.name"
        placeholder="Nombre del cliente"
        icon="i-lucide-user"
        class="w-full"
      />
    </UFormField>

    <UFormField name="phone" label="Teléfono" required class="col-span-2">
      <UInput
        v-model="state.phone"
        type="tel"
        placeholder="5512345678"
        icon="i-lucide-phone"
        class="w-full"
      />
    </UFormField>

    <UFormField name="notes" label="Notas" class="col-span-2">
      <UTextarea
        v-model="state.notes"
        placeholder="Notas sobre el cliente"
        :rows="3"
        autoresize
        :maxrows="5"
        class="w-full"
      />
    </UFormField>
  </UForm>
</template>
