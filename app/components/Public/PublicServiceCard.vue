<script setup lang="ts">
const props = defineProps<{
  service: Service;
  businessName?: string;
  businessPhone?: string | null;
}>();

const formattedDuration = computed(() => {
  const mins = props.service.duration_minutes ?? 0;
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}min` : `${hrs}h`;
});

const { formatCurrency } = MoneyUtils();

const formattedPrice = computed(() =>
  props.service.price == null ? null : formatCurrency(props.service.price),
);

const whatsappUrl = computed(() => {
  if (!props.businessPhone) return null;
  const digits = props.businessPhone.replace(/[^\d]/g, "");
  if (!digits) return null;
  // const detail = formattedPrice.value
  //   ? `${formattedDuration.value} - ${formattedPrice.value}`
  //   : formattedDuration.value;
  const text = encodeURIComponent(
    `Hola ${props.businessName ?? "el negocio"}, me interesa agendar: ${props.service.name}. ¿Qué horarios tienes disponibles?`,
  );
  return `https://wa.me/${digits}?text=${text}`;
});
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-4' }" class="overflow-hidden w-full">
    <!-- <template #header>
      <img
        :src="`https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80`"
        class="w-full h-48 object-cover rounded-lg"
        alt=""
      />
    </template> -->
    <div class="space-y-1.5">
      <p class="font-semibold text-highlighted">
        {{ service.name }}
      </p>
      <p v-if="service.description" class="text-sm text-muted line-clamp-3">
        {{ service.description }}
      </p>
      <div class="flex items-center gap-4 pt-1 text-sm">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="size-4 text-dimmed shrink-0" />
          <span class="text-muted">{{ formattedDuration }}</span>
        </div>
        <div v-if="formattedPrice" class="flex items-center gap-1.5">
          <span class="font-medium text-highlighted"
            >desde {{ formattedPrice }}</span
          >
        </div>
      </div>
    </div>

    <UButton
      v-if="whatsappUrl"
      :to="whatsappUrl"
      target="_blank"
      rel="noopener noreferrer"
      icon="i-lucide-message-circle"
      label="Agendar"
      color="primary"
      class="w-full flex justify-center mt-4"
      :aria-label="`Agendar ${service.name} por WhatsApp`"
    />
  </UCard>
</template>
