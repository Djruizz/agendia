<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Tables } from "~/types/database.types";
import { serviceSchema, type ServiceSchema } from "~/schemas/services";

const props = defineProps<{
  service?: Tables<"services">;
}>();

const emit = defineEmits<{
  submit: [payload: ServiceSchema];
  cancel: [];
}>();

const state = reactive<ServiceSchema>({
  name: "",
  description: "",
  duration_minutes: 30,
  price: 0,
});

const durationMinutes = computed({
  get: () => state.duration_minutes ?? 0,
  set: (val: number) => {
    state.duration_minutes = val;
  },
});

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

watch(
  () => props.service,
  (val) => {
    state.name = val?.name ?? "";
    state.description = val?.description ?? "";
    state.duration_minutes = val?.duration_minutes ?? 30;
    state.price = val?.price ?? 0;
    formRef.value?.clearErrors();
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<ServiceSchema>) {
  emit("submit", {
    name: event.data.name.trim(),
    description: event.data.description?.trim(),
    duration_minutes: event.data.duration_minutes,
    price: event.data.price,
  });
}
</script>

<template>
  <UForm
    id="service-form"
    ref="formRef"
    :schema="serviceSchema"
    :state="state"
    class="grid grid-cols-2 gap-4"
    @submit="onSubmit"
  >
    <UFormField name="name" label="Nombre" required class="col-span-2">
      <UInput
        v-model="state.name"
        placeholder="Nombre del servicio"
        icon="i-lucide-sparkles"
        class="w-full"
      />
    </UFormField>

    <UFormField name="description" label="Descripción" class="col-span-2">
      <UTextarea
        v-model="state.description"
        placeholder="Descripción del servicio"
        :rows="2"
        autoresize
        :maxrows="4"
        class="w-full"
      />
    </UFormField>

    <UFormField name="duration" label="Duración (minutos)">
      <UInput
        v-model.number="durationMinutes"
        type="number"
        min="1"
        placeholder="30"
        icon="i-lucide-clock"
        class="w-full"
      />
    </UFormField>

    <UFormField name="price" label="Precio (MXN)">
      <UInput
        v-model.number="state.price"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        icon="i-lucide-dollar-sign"
        class="w-full"
      />
    </UFormField>
  </UForm>
</template>
