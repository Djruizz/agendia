<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  BUSINESS_TIMEZONES,
  BUSINESS_TIMEZONE_LABELS,
  businessSchema,
  type BusinessSchema,
} from "~/schemas/business";
import { generateSlug, useSlugAvailability } from "~/composables/Business/utils/useSlug";

const emit = defineEmits<{
  submit: [payload: BusinessSchema];
}>();

const state = reactive<BusinessSchema>({
  business_name: "",
  owner_name: "",
  slug: "",
  description: "",
  category: "",
  phone: "",
  timezone: "America/Mexico_City",
});

const slugManuallyEdited = ref(false);

const slugRef = computed<string>({
  get: () => state.slug,
  set: (v) => {
    state.slug = v;
    slugManuallyEdited.value = true;
  },
});

const { data: slugCheck, isFetching: slugChecking } = useSlugAvailability(slugRef);

watch(
  () => state.business_name,
  (name) => {
    if (!slugManuallyEdited.value) state.slug = generateSlug(name);
  },
);

const timezoneOptions = BUSINESS_TIMEZONES.map((tz) => ({
  label: BUSINESS_TIMEZONE_LABELS[tz],
  value: tz,
}));

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

function onSubmit(event: FormSubmitEvent<BusinessSchema>) {
  emit("submit", {
    business_name: event.data.business_name.trim(),
    owner_name: event.data.owner_name?.trim() || undefined,
    slug: event.data.slug.toLowerCase().trim(),
    description: event.data.description?.trim() || undefined,
    category: event.data.category?.trim() || undefined,
    phone: event.data.phone?.trim() || undefined,
    timezone: event.data.timezone,
  });
}
</script>

<template>
  <UForm
    id="business-onboarding-form"
    ref="formRef"
    :schema="businessSchema"
    :state="state"
    @submit="onSubmit"
  >
    <div class="space-y-4">
      <UFormField name="business_name" label="Nombre del negocio" required>
        <UInput
          v-model="state.business_name"
          placeholder="Mi Studio"
          icon="i-lucide-store"
          class="w-full"
        />
      </UFormField>

      <UFormField name="owner_name" label="Tu nombre">
        <UInput
          v-model="state.owner_name"
          placeholder="Cómo te llamas"
          icon="i-lucide-user"
          class="w-full"
        />
      </UFormField>

      <UFormField name="category" label="Categoría o tipo de negocio">
        <UInput
          v-model="state.category"
          placeholder="Ej. Barbería, Consultorio, Salón…"
          icon="i-lucide-tag"
          class="w-full"
        />
      </UFormField>

      <UFormField name="phone" label="Teléfono o WhatsApp">
        <UInput
          v-model="state.phone"
          placeholder="+52 999 123 4567"
          icon="i-lucide-phone"
          class="w-full"
        />
      </UFormField>

      <UFormField name="timezone" label="Zona horaria" required>
        <USelect
          v-model="state.timezone"
          :items="timezoneOptions"
          icon="i-lucide-globe"
          class="w-full"
        />
      </UFormField>

      <UFormField name="slug" label="Enlace público" required>
        <UInput
          v-model="slugRef"
          placeholder="mi-studio"
          icon="i-lucide-link"
          autocomplete="off"
          class="w-full"
        >
          <template #trailing>
            <UIcon
              v-if="slugChecking"
              name="i-lucide-loader-circle"
              class="size-4 animate-spin text-muted"
            />
            <UIcon
              v-else-if="slugCheck?.available"
              name="i-lucide-check-circle"
              class="size-4 text-success"
            />
            <UIcon
              v-else-if="slugCheck && !slugCheck.available"
              name="i-lucide-circle-x"
              class="size-4 text-error"
            />
          </template>
        </UInput>
        <template #help>
          <span class="text-xs text-muted">
            Tu página pública estará en /p/{{ state.slug || "tu-enlace" }}
          </span>
        </template>
      </UFormField>

      <UFormField name="description" label="Descripción">
        <UTextarea
          v-model="state.description"
          placeholder="Una breve descripción de tu negocio"
          :rows="2"
          autoresize
          :maxrows="4"
          class="w-full"
        />
      </UFormField>
    </div>
  </UForm>
</template>