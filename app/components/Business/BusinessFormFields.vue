<script setup lang="ts">
import {
  BUSINESS_TIMEZONES,
  BUSINESS_TIMEZONE_LABELS,
  type BusinessProfileEditSchema,
} from "~/schemas/business";

const props = defineProps<{
  state: BusinessProfileEditSchema;
}>();

const timezoneOptions = BUSINESS_TIMEZONES.map((tz) => ({
  label: BUSINESS_TIMEZONE_LABELS[tz],
  value: tz,
}));
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <UFormField
      name="business_name"
      label="Nombre del negocio"
      required
      class="sm:col-span-2"
    >
      <UInput
        v-model="props.state.business_name"
        placeholder="Mi Studio"
        icon="i-lucide-store"
        class="w-full"
      />
    </UFormField>

    <UFormField name="owner_name" label="Tu nombre">
      <UInput
        v-model="props.state.owner_name"
        placeholder="Cómo te llamas"
        icon="i-lucide-user"
        class="w-full"
      />
    </UFormField>

    <UFormField name="category" label="Categoría o tipo de negocio">
      <UInput
        v-model="props.state.category"
        placeholder="Ej. Barbería, Consultorio, Salón…"
        icon="i-lucide-tag"
        class="w-full"
      />
    </UFormField>

    <UFormField name="phone" label="Teléfono o WhatsApp">
      <UInput
        v-model="props.state.phone"
        placeholder="+52 999 123 4567"
        icon="i-lucide-phone"
        class="w-full"
      />
    </UFormField>

    <UFormField name="timezone" label="Zona horaria" required>
      <USelect
        v-model="props.state.timezone"
        :items="timezoneOptions"
        icon="i-lucide-globe"
        class="w-full"
        disabled
      />
    </UFormField>

    <UFormField name="description" label="Descripción" class="sm:col-span-2">
      <UTextarea
        v-model="props.state.description"
        placeholder="Una breve descripción de tu negocio"
        :rows="2"
        autoresize
        :maxrows="4"
        class="w-full"
      />
    </UFormField>

    <slot />
  </div>
</template>