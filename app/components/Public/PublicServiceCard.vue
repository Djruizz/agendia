<script setup lang="ts">
const props = defineProps<{
  service: Service;
  businessName?: string;
  businessPhone?: string | null;
}>();

const isImageModalOpen = ref(false);

const imageUrl = useServiceImagePublicUrl(
  computed(() => props.service.image_path),
);

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
  const text = encodeURIComponent(
    `Hola ${props.businessName ?? "el negocio"}, me interesa agendar: ${props.service.name}. ¿Qué horarios tienes disponibles?`,
  );
  return `https://wa.me/${digits}?text=${text}`;
});
</script>

<template>
  <UCard
    variant="subtle"
    :ui="{
      header: 'p-0 overflow-hidden',
      body: 'p-4 flex-1 flex flex-col justify-between',
    }"
    class="overflow-hidden w-full flex flex-col"
  >
    <template v-if="imageUrl" #header>
      <div
        class="w-full aspect-video overflow-hidden bg-muted/20 relative group cursor-pointer"
        @click="isImageModalOpen = true"
      >
        <img
          :src="imageUrl"
          :alt="service.name"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />

        <!-- Botón de lupa para abrir modal y ver imagen completa sin cortar -->
        <div class="absolute top-2.5 right-2.5 z-10">
          <UButton
            icon="i-lucide-zoom-in"
            size="sm"
            color="neutral"
            variant="solid"
            class="rounded-full shadow-md bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs border-0"
            aria-label="Ver imagen completa"
            @click.stop="isImageModalOpen = true"
          />
        </div>
      </div>
    </template>

    <div class="space-y-1.5 flex-1">
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

  <!-- Modal en pantalla completa para ver la imagen completa sin cortar -->
  <UModal
    v-if="imageUrl"
    v-model:open="isImageModalOpen"
    fullscreen
    :title="service.name"
    :ui="{
      // content: 'bg-black/95 text-white flex flex-col',
      header: 'border-b border-white/10 px-4 py-3 sm:px-6',
      body: 'flex-1 p-2 sm:p-6 flex flex-col items-center justify-center overflow-hidden min-h-0',
      footer:
        'border-t border-white/10 p-4 sm:px-6 flex justify-between items-center flex-wrap gap-3',
    }"
  >
    <template #title>
      <span class="font-semibold">{{ service.name }}</span>
    </template>

    <template #description>
      <span v-if="service.description" class="text-muted text-xs">
        {{ service.description }}
      </span>
    </template>

    <template #body>
      <div class="w-full h-full flex items-center justify-center select-none">
        <img
          :src="imageUrl"
          :alt="service.name"
          class="max-w-full max-h-[75vh] sm:max-h-[82vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
        />
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex items-center gap-3 text-sm">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-clock" class="size-4 text-muted shrink-0" />
          <span>{{ formattedDuration }}</span>
        </div>
        <div v-if="formattedPrice" class="font-semibold">
          desde {{ formattedPrice }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          label="Cerrar"
          color="neutral"
          variant="ghost"
          @click="close"
        />
        <UButton
          v-if="whatsappUrl"
          :to="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          icon="i-lucide-message-circle"
          label="Agendar por WhatsApp"
          color="primary"
          :aria-label="`Agendar ${service.name} por WhatsApp`"
        />
      </div>
    </template>
  </UModal>
</template>
