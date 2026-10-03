<script setup lang="ts">
import {
  SOCIAL_PLATFORMS,
  detectSocialNetwork,
  normalizeSocialUrl,
  getSocialPlatform,
} from "~/utils/socialNetworks";
import {
  businessSocialsSchema,
  type BusinessSocialItemSchema,
} from "~/schemas/business";

const toast = useToast();
const { data: profile } = useBusinessProfile();
const updateProfile = useUpdateBusinessProfile();

const items = ref<BusinessSocialItemSchema[]>([]);
const initialized = ref(false);

const networkOptions = SOCIAL_PLATFORMS.map((platform) => ({
  label: platform.name,
  value: platform.key,
  icon: platform.icon,
}));

function applyFromProfile(val: NonNullable<typeof profile.value>) {
  if (Array.isArray(val.socials)) {
    const list = val.socials as unknown as BusinessSocialItem[];
    items.value = list.map((s) => ({
      network: String(s.network || "other"),
      url: String(s.url || ""),
    }));
  } else {
    items.value = [];
  }
}

watch(
  () => profile.value,
  (val) => {
    if (!val || initialized.value) return;
    initialized.value = true;
    applyFromProfile(val);
  },
  { immediate: true },
);

function addSocial() {
  if (items.value.length >= 5) return;
  // Sugerir la primera red que aún no esté en la lista
  const usedKeys = new Set(items.value.map((i) => i.network));
  const available = SOCIAL_PLATFORMS.find((p) => p.key !== "other" && !usedKeys.has(p.key));
  const defaultKey = available ? available.key : "instagram";

  items.value.push({
    network: defaultKey,
    url: "",
  });
}

function removeSocial(index: number) {
  items.value.splice(index, 1);
}

function onUrlInput(index: number) {
  const current = items.value[index];
  if (!current) return;
  const detected = detectSocialNetwork(current.url);
  if (detected !== "other") {
    current.network = detected;
  }
}

function onUrlBlur(index: number) {
  const current = items.value[index];
  if (!current || !current.url.trim()) return;
  current.url = normalizeSocialUrl(current.url);
}

const originalJson = computed(() => {
  const list = Array.isArray(profile.value?.socials)
    ? (profile.value.socials as unknown as BusinessSocialItem[])
    : [];
  return JSON.stringify(
    list.map((i) => ({
      network: String(i.network),
      url: normalizeSocialUrl(String(i.url)),
    })),
  );
});

const currentJson = computed(() => {
  return JSON.stringify(
    items.value.map((i) => ({
      network: i.network,
      url: normalizeSocialUrl(i.url),
    })),
  );
});

const isDirty = computed(() => originalJson.value !== currentJson.value);
const isSaving = computed(() => updateProfile.isPending.value);

async function saveSocials() {
  // Filtrar filas completamente vacías si el usuario agregó una y no escribió nada
  const cleanList = items.value
    .map((item) => ({
      network: item.network,
      url: normalizeSocialUrl(item.url),
    }))
    .filter((item) => item.url.length > 0);

  // Validar con Zod
  const result = businessSocialsSchema.safeParse(cleanList);
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message ?? "Verifica los enlaces ingresados";
    toast.add({
      icon: "i-lucide-alert-circle",
      title: "No se pudieron guardar las redes sociales",
      description: errorMsg,
      color: "error",
    });
    return;
  }

  try {
    const updated = await updateProfile.mutateAsync({
      socials: cleanList,
    });
    applyFromProfile(updated);
    toast.add({
      icon: "i-lucide-check",
      title: "Redes sociales actualizadas",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "Error al guardar redes sociales",
      description: describeMutationError(err),
      color: "error",
    });
  }
}
</script>

<template>
  <SettingsSection
    icon="i-lucide-share-2"
    title="Redes sociales"
    description="Conecta tus perfiles sociales para que tus clientes te sigan y contacten (máximo 5)."
  >
    <!-- Estado vacío -->
    <div
      v-if="items.length === 0"
      class="text-center py-8 px-4 border border-dashed border-default rounded-xl space-y-3"
    >
      <div class="size-10 rounded-full bg-subtle flex items-center justify-center mx-auto text-muted">
        <UIcon name="i-lucide-share-2" class="size-5" />
      </div>
      <div>
        <p class="text-sm font-medium text-highlighted">No has agregado redes sociales</p>
        <p class="text-xs text-muted max-w-sm mx-auto mt-0.5">
          Agrega enlaces de Instagram, TikTok, Facebook, WhatsApp, etc. Se mostrarán como botones de acceso rápido en tu página pública.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        label="Agregar red social"
        color="primary"
        variant="soft"
        size="sm"
        @click="addSocial"
      />
    </div>

    <!-- Lista de enlaces de redes sociales -->
    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="index"
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-2.5 rounded-lg bg-subtle/40 sm:bg-transparent border border-default sm:border-0"
      >
        <div class="flex items-center gap-2">
          <USelect
            v-model="item.network"
            :items="networkOptions"
            class="flex-1 sm:w-48 shrink-0"
          >
            <template #leading>
              <UIcon
                :name="getSocialPlatform(item.network).icon"
                class="size-4 shrink-0"
                :class="getSocialPlatform(item.network).colorClass"
              />
            </template>
          </USelect>
          <UButton
            icon="i-lucide-trash"
            color="error"
            variant="ghost"
            class="sm:hidden"
            aria-label="Eliminar red social"
            @click="removeSocial(index)"
          />
        </div>

        <UInput
          v-model="item.url"
          :placeholder="getSocialPlatform(item.network).placeholder"
          class="flex-1 min-w-0"
          @input="onUrlInput(index)"
          @blur="onUrlBlur(index)"
        />

        <UButton
          icon="i-lucide-trash"
          color="error"
          variant="ghost"
          class="hidden sm:inline-flex shrink-0"
          aria-label="Eliminar red social"
          @click="removeSocial(index)"
        />
      </div>
    </div>

    <!-- Barra de acciones y conteo -->
    <div
      v-if="items.length > 0"
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-default"
    >
      <div class="flex items-center gap-2">
        <UButton
          v-if="items.length < 5"
          icon="i-lucide-plus"
          label="Agregar otra red"
          color="neutral"
          variant="outline"
          size="sm"
          @click="addSocial"
        />
        <UBadge
          :color="items.length >= 5 ? 'warning' : 'neutral'"
          variant="subtle"
          size="sm"
        >
          {{ items.length }} de 5 agregadas
        </UBadge>
      </div>

      <UButton
        label="Guardar cambios"
        color="primary"
        :disabled="!isDirty || isSaving"
        :loading="isSaving"
        @click="saveSocials"
      />
    </div>
  </SettingsSection>
</template>
