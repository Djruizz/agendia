<script setup lang="ts">
import { COLOR_THEMES, type ColorTheme } from "~/schemas/preferences";

definePageMeta({
  layout: "public",
});

const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));

const { data: business, isFetching: loading } = usePublicBusiness(slug);
const { data: services, isFetching: servicesLoading } = usePublicServices(
  computed(() => business.value?.user_id),
);

const logoUrl = useLogoPublicUrl(
  computed(() => business.value?.logo_path ?? null),
);

useSeoMeta({
  title: () => business.value?.business_name ?? "Agendia",
  description: () => business.value?.description ?? "Perfil público en Agendia",
  ogTitle: () =>
    business.value ? `${business.value.business_name} | Agendia` : "Agendia",
  ogDescription: () =>
    business.value?.description ?? "Perfil público en Agendia",
  ogImage: () => logoUrl.value ?? undefined,
});

// Aplica el color del negocio al appConfig solo mientras esta página está
// montada. El style :root de @nuxt/ui es reactivo a appConfig.ui.colors,
// así que toda la vista pública se re-tematiza al instante. Al salir se
// restaura el valor previo (default pink para visitantes anónimos o la
// preferencia del usuario si el dueño entra en preview).
const appConfig = useAppConfig();
const previousColor = appConfig.ui.colors.primary as ColorTheme;

watch(
  () => (business.value as unknown as { brand_color?: string | null } | null)?.brand_color,
  (color) => {
    if (color && (COLOR_THEMES as readonly string[]).includes(color)) {
      appConfig.ui.colors.primary = color as ColorTheme;
    }
  },
);

onUnmounted(() => {
  appConfig.ui.colors.primary = previousColor;
});
</script>

<template>
  <UContainer class="space-y-6">
    <div v-if="loading" class="space-y-5">
      <div class="flex items-start gap-4">
        <USkeleton class="size-16 rounded-xl" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-7 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </div>
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-5/6" />
      <USkeleton class="h-11 w-full" />
    </div>

    <div v-else-if="!business" class="text-center py-12 space-y-3">
      <UIcon name="i-lucide-store" class="size-10 text-muted mx-auto" />
      <p class="text-base font-medium text-highlighted">
        Este negocio no está disponible
      </p>
      <p class="text-sm text-muted">
        Es posible que el enlace haya cambiado o el negocio aún no publicó su
        página.
      </p>
      <UButton
        to="/"
        label="Ir al inicio de Agendia"
        color="neutral"
        variant="outline"
        class="mt-2"
      />
    </div>

    <template v-else>
      <PublicBusinessHeader :business="business" :logo-url="logoUrl" />

      <PublicServiceList
        v-if="services && services.length > 0"
        :services="services"
        :loading="servicesLoading"
      />
    </template>
  </UContainer>
</template>
