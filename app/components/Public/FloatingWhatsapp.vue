<script setup lang="ts">
const props = defineProps<{ phoneNumber?: string }>();

const whatsappUrl = computed(() => {
  if (!props.phoneNumber) return null;
  const digits = props.phoneNumber.replace(/[^\d]/g, "");
  if (!digits) return null;
  const text = encodeURIComponent(`Hola, me interesa agendar una cita.`);
  return `https://wa.me/${digits}?text=${text}`;
});
</script>

<template>
  <a
    v-if="whatsappUrl"
    :href="whatsappUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="size-12 fixed inset-auto bottom-4 right-4 lg:bottom-6 lg:right-6 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex justify-center items-center hover:cursor-pointer transition-all duration-200 hover:scale-105"
    aria-label="WhatsApp"
  >
    <UIcon name="i-lucide-message-circle" class="text-2xl mx-auto my-auto" />
  </a>
</template>
