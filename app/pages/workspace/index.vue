<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { serviceSchema, type ServiceSchema } from "~/schemas/services";

definePageMeta({
  layout: "workspace",
  middleware: "auth",
});

const { data: services } = useServices();

const state = ref<ServiceSchema>({
  name: "",
  price: 0,
  duration_minutes: 0,
  description: "",
});
const { mutate: create } = useCreateService();
const onSubmit = (form: FormSubmitEvent<ServiceSchema>) => {
  create(form.data);
};
const { mutate: update } = useUpdateService();
const updateDummy = () => {
  update({
    id: "0badf4df-b40a-4204-bc4b-3eff0cde5c19",
    service: {
      name: "Servicio actualizado",
      price: Math.floor(Math.random() * 1000),
      duration_minutes: Math.floor(Math.random() * 60),
      description: "Descripción actualizada",
    },
  });
};
</script>
<template>
  <div>
    <LayoutPageHeader
      title="Dashboard"
      description="Resumen general de tu negocio"
      icon="i-lucide-home"
    />
    <pre
      class="overflow-x-auto whitespace-pre-wrap break-words max-w-full text-xs bg-elevated/40 p-3 rounded-lg"
      >{{ services }}</pre
    >
    <UForm :schema="serviceSchema" @submit="onSubmit" :state="state">
      <UFormField label="Nombre" name="name">
        <UInput v-model="state.name" />
      </UFormField>
      <UFormField label="Precio" name="price">
        <UInput v-model="state.price" type="number" />
      </UFormField>
      <UFormField label="Duración estimada (mins)" name="duration_minutes">
        <UInput v-model="state.duration_minutes" type="number" />
      </UFormField>
      <UFormField label="Descripción" name="description">
        <UInput v-model="state.description" />
      </UFormField>
      <UButton type="submit">Agregar servicio</UButton>
    </UForm>
    <UButton @click="updateDummy">Actualizar</UButton>
  </div>
</template>
