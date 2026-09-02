<script setup lang="ts">
import type { ServiceSchema } from "~/schemas/services";
import type { BusinessSchema } from "~/schemas/business";

definePageMeta({
  layout: "auth",
  middleware: "auth",
});

const route = useRoute();
const toast = useToast();

const { data: existing } = useBusinessProfile();
const { mutateAsync: createProfile, isPending: creatingProfile } =
  useCreateBusinessProfile();
const { mutateAsync: createService, isPending: creatingService } =
  useCreateService();

const step = ref(0);
const pendingBusiness = ref<BusinessSchema | null>(null);

function getRedirect(): string {
  const r = route.query.redirect;
  return typeof r === "string" && r.startsWith("/") ? r : "/workspace";
}

const stepItems = [
  {
    slot: "business" as const,
    title: "Tu negocio",
    description: "Datos básicos",
    icon: "i-lucide-store",
  },
  {
    slot: "service" as const,
    title: "Primer servicio",
    description: "Opcional",
    icon: "i-lucide-scissors",
  },
];

async function onBusinessSubmit(payload: BusinessSchema) {
  pendingBusiness.value = payload;
  step.value = 1;
}

async function onServiceSubmit(payload: ServiceSchema) {
  if (!pendingBusiness.value) {
    await navigateTo(getRedirect(), { replace: true });
    return;
  }
  try {
    await createProfile(pendingBusiness.value);
    await createService(payload);
    pendingBusiness.value = null;
    await navigateTo(getRedirect(), { replace: true });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message ?? "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

async function onSkipService() {
  if (!pendingBusiness.value) {
    await navigateTo(getRedirect(), { replace: true });
    return;
  }
  try {
    await createProfile(pendingBusiness.value);
    pendingBusiness.value = null;
    await navigateTo(getRedirect(), { replace: true });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message ?? "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

async function onSkipAll() {
  try {
    const slug = `negocio-${Math.random().toString(36).slice(2, 8)}`;
    await createProfile({
      business_name: "Mi negocio",
      slug,
      timezone: "America/Mexico_City",
    });
    await navigateTo(getRedirect(), { replace: true });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message ?? "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

watch(
  () => existing.value,
  (val) => {
    if (val) navigateTo("/workspace", { replace: true });
  },
  { immediate: true },
);
</script>

<template>
  <UCard class="max-w-2xl mx-auto">
    <div class="space-y-4">
      <div>
        <h1 class="text-xl font-semibold text-highlighted">
          Bienvenido a Agendia
        </h1>
        <p class="text-sm text-muted mt-1">
          Configura tu negocio para empezar a usarlo.
        </p>
      </div>

      <UStepper v-model="step" :items="stepItems">
        <template #business>
          <BusinessOnboardingForm @submit="onBusinessSubmit" />
        </template>

        <template #service>
          <div class="space-y-3">
            <p class="text-sm text-muted">
              Puedes crear tu primer servicio ahora o hacerlo más tarde desde la
              sección de servicios.
            </p>
            <ServiceForm @submit="onServiceSubmit" />
            <UButton
              label="Omitir este paso"
              variant="ghost"
              color="neutral"
              block
              @click="onSkipService"
            />
          </div>
        </template>
      </UStepper>

      <USeparator />

      <div class="flex items-center justify-between">
        <UButton
          v-if="step === 0"
          label="Saltar por ahora"
          variant="link"
          color="neutral"
          size="sm"
          @click="onSkipAll"
        />
        <span v-else />
        <UButton
          v-if="step === 0"
          type="submit"
          form="business-onboarding-form"
          label="Continuar"
          color="primary"
        />
        <UButton
          v-else
          type="submit"
          form="service-form"
          label="Crear y empezar"
          color="primary"
          :loading="creatingProfile || creatingService"
        />
      </div>
    </div>
  </UCard>
</template>
