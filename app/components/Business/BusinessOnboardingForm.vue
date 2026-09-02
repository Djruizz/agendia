<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { businessSchema, type BusinessSchema } from "~/schemas/business";
import {
  generateSlug,
  useSlugAvailability,
} from "~/composables/Business/utils/useSlug";

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

const { data: slugCheck, isFetching: slugChecking } =
  useSlugAvailability(slugRef);

const slugMatchesCheck = computed(
  () => slugCheck.value?.slug === state.slug,
);
const verifying = computed(
  () => slugChecking.value || !slugMatchesCheck.value,
);

watch(
  () => state.business_name,
  (name) => {
    if (!slugManuallyEdited.value) state.slug = generateSlug(name);
  },
);

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
    :schema="businessSchema"
    :state="state"
    @submit="onSubmit"
  >
    <BusinessFormFields :state="state">
      <UFormField
        name="slug"
        label="Enlace público"
        required
        class="sm:col-span-2"
      >
        <UInput
          v-model="slugRef"
          placeholder="mi-studio"
          icon="i-lucide-link"
          autocomplete="off"
          class="w-full"
        >
          <template #trailing>
            <UIcon
              v-if="verifying"
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
    </BusinessFormFields>
  </UForm>
</template>
