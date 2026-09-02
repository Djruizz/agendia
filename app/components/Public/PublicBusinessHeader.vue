<script setup lang="ts">
const props = defineProps<{
  business: BusinessProfile;
  logoUrl: string | null;
}>();

const sanitizePhone = (phone: string) => phone.replace(/[^\d]/g, "");

const whatsappLink = computed(() => {
  if (!props.business.phone) return null;
  const digits = sanitizePhone(props.business.phone);
  if (!digits) return null;
  const text = encodeURIComponent(
    `Hola ${props.business.business_name}, me interesa agendar una cita.`,
  );
  return `https://wa.me/${digits}?text=${text}`;
});

const initial = computed(() =>
  props.business.business_name.charAt(0).toUpperCase(),
);
</script>

<template>
  <header class="space-y-5">
    <div class="flex items-start gap-4">
      <div
        class="size-16 rounded-xl ring-1 ring-default bg-elevated flex items-center justify-center overflow-hidden shrink-0"
      >
        <img
          v-if="logoUrl"
          :src="logoUrl"
          :alt="`Logo de ${business.business_name}`"
          class="size-full object-cover"
        />
        <span v-else class="text-xl font-semibold text-muted">
          {{ initial }}
        </span>
      </div>
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold text-highlighted">
          {{ business.business_name }}
        </h1>
        <p
          v-if="business.category"
          class="text-sm text-muted mt-0.5"
        >
          {{ business.category }}
        </p>
        <p
          v-if="business.owner_name"
          class="text-sm text-muted"
        >
          {{ business.owner_name }}
        </p>
      </div>
    </div>

    <p
      v-if="business.description"
      class="text-base text-default whitespace-pre-line"
    >
      {{ business.description }}
    </p>

    <div v-if="whatsappLink">
      <UButton
        :to="whatsappLink"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-lucide-message-circle"
        label="Contactar por WhatsApp"
        color="primary"
        size="lg"
        block
      />
    </div>
  </header>
</template>
