<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  businessProfileEditSchema,
  type BusinessProfileEditSchema,
  type BusinessTimezone,
} from "~/schemas/business";

const toast = useToast();

const { data: profile } = useBusinessProfile();
const updateProfile = useUpdateBusinessProfile();

const state = reactive<BusinessProfileEditSchema>({
  business_name: "",
  owner_name: "",
  description: "",
  category: "",
  phone: "",
  timezone: "America/Mexico_City",
});

watch(
  () => profile.value,
  (val) => {
    if (!val) return;
    state.business_name = val.business_name;
    state.owner_name = val.owner_name ?? "";
    state.description = val.description ?? "";
    state.category = val.category ?? "";
    state.phone = val.phone ?? "";
    state.timezone = val.timezone as BusinessTimezone;
  },
  { immediate: true },
);

const original = computed(() => ({
  business_name: profile.value?.business_name ?? "",
  owner_name: profile.value?.owner_name ?? "",
  description: profile.value?.description ?? "",
  category: profile.value?.category ?? "",
  phone: profile.value?.phone ?? "",
  timezone: profile.value?.timezone ?? "America/Mexico_City",
}));

const isDirty = computed(() =>
  (Object.keys(state) as (keyof BusinessProfileEditSchema)[]).some(
    (k) => (state[k] ?? "") !== (original.value[k] ?? ""),
  ),
);

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

async function saveProfile(event: FormSubmitEvent<BusinessProfileEditSchema>) {
  try {
    await updateProfile.mutateAsync({
      business_name: event.data.business_name.trim(),
      owner_name: event.data.owner_name?.trim() || null,
      description: event.data.description?.trim() || null,
      category: event.data.category?.trim() || null,
      phone: event.data.phone?.trim() || null,
      timezone: event.data.timezone,
    });
    toast.add({
      icon: "i-lucide-check",
      title: "Perfil del negocio actualizado",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo guardar el perfil",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  }
}

const fileInput = ref<HTMLInputElement | null>(null);
const uploadLogo = useUploadLogo();
const removeLogo = useRemoveLogo();
const logoUrl = useLogoPublicUrl(
  computed(() => profile.value?.logo_path ?? null),
);

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const previousPath = profile.value?.logo_path ?? null;
  try {
    const newPath = await uploadLogo.mutateAsync(file);
    await updateProfile.mutateAsync({ logo_path: newPath });
    if (previousPath) {
      await removeLogo.mutateAsync(previousPath).catch(() => {});
    }
    toast.add({
      icon: "i-lucide-check",
      title: "Logo actualizado",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo subir el logo",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  } finally {
    input.value = "";
  }
}

async function onRemoveLogo() {
  const currentPath = profile.value?.logo_path;
  if (!currentPath) return;
  try {
    await updateProfile.mutateAsync({ logo_path: null });
    await removeLogo.mutateAsync(currentPath);
    toast.add({
      icon: "i-lucide-check",
      title: "Logo eliminado",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo eliminar el logo",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  }
}

const isPublished = computed<boolean>({
  get: () => profile.value?.is_published ?? false,
  set: (value) => {
    if (value === profile.value?.is_published) return;
    updateProfile.mutate(
      { is_published: value },
      {
        onSuccess: () =>
          toast.add({
            icon: "i-lucide-check",
            title: value
              ? "Tu página ya es pública"
              : "Tu página ya no es pública",
            color: "success",
          }),
        onError: () =>
          toast.add({
            icon: "i-lucide-x",
            title: "No se pudo actualizar la publicación",
            color: "error",
          }),
      },
    );
  },
});

const publicUrl = computed(() => {
  const slug = profile.value?.slug;
  if (!slug) return "";
  return `${window.location.origin}/p/${slug}`;
});

async function copyLink() {
  if (!publicUrl.value) return;
  try {
    await navigator.clipboard.writeText(publicUrl.value);
    toast.add({
      icon: "i-lucide-check",
      title: "Enlace copiado",
      color: "success",
    });
  } catch {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo copiar el enlace",
      color: "error",
    });
  }
}
</script>

<template>
  <SettingsSection
    icon="i-lucide-store"
    title="Perfil del negocio"
    description="Edita los datos comerciales y la publicación de tu página."
  >
    <div class="flex items-center gap-4">
      <div
        class="size-16 rounded-lg ring-1 ring-default bg-elevated flex items-center justify-center overflow-hidden shrink-0"
      >
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="Logo"
          class="size-full object-cover"
        />
        <UIcon v-else name="i-lucide-image" class="size-6 text-muted" />
      </div>
      <div class="flex flex-col gap-2">
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          class="hidden"
          @change="onFileChange"
        />
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            label="Subir logo"
            icon="i-lucide-upload"
            color="neutral"
            variant="outline"
            :loading="uploadLogo.isPending.value"
            @click="fileInput?.click()"
          />
          <UButton
            v-if="profile?.logo_path"
            label="Quitar"
            icon="i-lucide-trash"
            color="error"
            variant="ghost"
            :loading="removeLogo.isPending.value"
            @click="onRemoveLogo"
          />
        </div>
        <p class="text-xs text-muted">PNG, JPG, WEBP o SVG. Máximo 2MB.</p>
      </div>
    </div>

    <UForm
      ref="formRef"
      :schema="businessProfileEditSchema"
      :state="state"
      @submit="saveProfile"
    >
      <BusinessFormFields :state="state">
        <div class="sm:col-span-2 flex justify-end">
          <UButton
            type="submit"
            label="Guardar cambios"
            color="primary"
            :disabled="!isDirty"
            :loading="updateProfile.isPending.value"
          />
        </div>
      </BusinessFormFields>
    </UForm>

    <SettingsRow
      label="Enlace público"
      description="Personaliza el slug de tu página pública. (3+ caracteres)"
      wrap
    >
      <SettingsSlugInput v-if="profile?.slug" :current-slug="profile.slug" />
    </SettingsRow>

    <SettingsRow
      label="Publicar mi página"
      description="Activá la publicación para que tu página sea visible en /p/[slug]."
    >
      <USwitch
        v-model="isPublished"
        :disabled="updateProfile.isPending.value"
      />
    </SettingsRow>

    <SettingsRow
      label="Copiar enlace público"
      description="Compartí esta URL con tus clientes."
    >
      <UButton
        icon="i-lucide-copy"
        label="Copiar"
        color="neutral"
        variant="outline"
        :disabled="!publicUrl"
        @click="copyLink"
      />
    </SettingsRow>
  </SettingsSection>
</template>
