<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Tables } from "~/types/database.types";
import { serviceSchema, type ServiceSchema } from "~/schemas/services";
import {
  MAX_PUBLIC_SERVICES,
  usePublicServicesCount,
} from "~/composables/Service/queries/useServices";

const props = defineProps<{
  service?: Tables<"services">;
}>();

const emit = defineEmits<{
  submit: [payload: ServiceSchema];
  cancel: [];
}>();

const toast = useToast();
const { data: publicCountQuery } = usePublicServicesCount();
const uploadImage = useUploadServiceImage();
const removeImage = useRemoveServiceImage();

const isUploadingImage = ref(false);
const fileInputRef = useTemplateRef<HTMLInputElement>("fileInputRef");
// Almacena las imágenes subidas en esta sesión para borrarlas si se cancela el formulario
const sessionUploadedPaths = ref<string[]>([]);

const state = reactive<ServiceSchema>({
  name: "",
  description: "",
  duration_minutes: 30,
  price: 0,
  is_public: true,
  image_path: null,
});

const durationMinutes = computed({
  get: () => state.duration_minutes ?? 0,
  set: (val: number) => {
    state.duration_minutes = val;
  },
});

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

const publicCount = computed(() => publicCountQuery.value ?? 0);

// Si el servicio ya era público en BD, no cuenta como nuevo slot
const isOriginallyPublic = computed(
  () => props.service?.is_public === true && props.service?.is_active === true,
);

const isAtPublicLimit = computed(() => {
  if (isOriginallyPublic.value) {
    return false;
  }
  return publicCount.value >= MAX_PUBLIC_SERVICES;
});

const canTogglePublic = computed(() => {
  if (state.is_public) return true;
  return !isAtPublicLimit.value;
});

const imageUrl = useServiceImagePublicUrl(computed(() => state.image_path));

watch(
  () => props.service,
  (val) => {
    state.name = val?.name ?? "";
    state.description = val?.description ?? "";
    state.duration_minutes = val?.duration_minutes ?? 30;
    state.price = val?.price ?? 0;
    // Si es nuevo y ya se alcanzó el límite de públicos, por defecto no es público
    state.is_public = val ? val.is_public : !isAtPublicLimit.value;
    state.image_path = val?.image_path ?? null;
    sessionUploadedPaths.value = [];
    formRef.value?.clearErrors();
  },
  { immediate: true },
);

function onTogglePublic(val: boolean) {
  if (val && isAtPublicLimit.value) {
    toast.add({
      title: "Límite de servicios públicos alcanzado",
      description: `Puedes tener un máximo de ${MAX_PUBLIC_SERVICES} servicios públicos en tu catálogo. Desactiva otro servicio para hacer público este.`,
      color: "warning",
      icon: "i-lucide-alert-triangle",
    });
    return;
  }
  state.is_public = val;
  if (!val && state.image_path) {
    // Si se pasa a solo interno, se limpia la foto para ahorrar storage
    if (sessionUploadedPaths.value.includes(state.image_path)) {
      removeImage.mutateAsync(state.image_path).catch(() => {});
      sessionUploadedPaths.value = sessionUploadedPaths.value.filter(
        (p) => p !== state.image_path,
      );
    }
    state.image_path = null;
  }
}

function onTriggerFileInput() {
  fileInputRef.value?.click();
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploadingImage.value = true;
  try {
    const newPath = await uploadImage.mutateAsync(file);

    // Si ya habíamos subido una imagen en esta misma sesión, la removemos para no dejar basura
    const previousInSession = sessionUploadedPaths.value.find(
      (p) => p !== props.service?.image_path,
    );
    if (previousInSession) {
      removeImage.mutateAsync(previousInSession).catch(() => {});
      sessionUploadedPaths.value = sessionUploadedPaths.value.filter(
        (p) => p !== previousInSession,
      );
    }

    sessionUploadedPaths.value.push(newPath);
    state.image_path = newPath;

    toast.add({
      title: "Foto optimizada y lista",
      description: "La imagen se comprimió automáticamente a formato WebP.",
      color: "success",
      icon: "i-lucide-check",
    });
  } catch (err: any) {
    toast.add({
      title: "Error al subir la imagen",
      description: describeMutationError(err),
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    isUploadingImage.value = false;
    input.value = "";
  }
}

async function onRemoveImage() {
  const pathToRemove = state.image_path;
  if (!pathToRemove) return;

  // Si fue subida en esta misma sesión, eliminarla de inmediato
  if (sessionUploadedPaths.value.includes(pathToRemove)) {
    await removeImage.mutateAsync(pathToRemove).catch(() => {});
    sessionUploadedPaths.value = sessionUploadedPaths.value.filter(
      (p) => p !== pathToRemove,
    );
  }
  state.image_path = null;
}

// Limpieza para el componente padre en caso de cancelar el modal sin guardar
function cleanupUnsaved() {
  for (const path of sessionUploadedPaths.value) {
    if (path !== props.service?.image_path) {
      removeImage.mutateAsync(path).catch(() => {});
    }
  }
  sessionUploadedPaths.value = [];
}

defineExpose({
  cleanupUnsaved,
});

function onSubmit(event: FormSubmitEvent<ServiceSchema>) {
  emit("submit", {
    name: event.data.name.trim(),
    description: event.data.description?.trim(),
    duration_minutes: event.data.duration_minutes,
    price: event.data.price,
    is_public: state.is_public,
    image_path: state.is_public ? state.image_path : null,
  });
}
</script>

<template>
  <UForm
    id="service-form"
    ref="formRef"
    :schema="serviceSchema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-2 gap-4">
      <UFormField name="name" label="Nombre" required class="col-span-2">
        <UInput
          v-model="state.name"
          placeholder="Nombre del servicio"
          icon="i-lucide-sparkles"
          class="w-full"
        />
      </UFormField>

      <UFormField name="description" label="Descripción" class="col-span-2">
        <UTextarea
          v-model="state.description"
          placeholder="Descripción del servicio (opcional)"
          :rows="2"
          autoresize
          :maxrows="4"
          class="w-full"
        />
      </UFormField>

      <UFormField name="duration_minutes" label="Duración (minutos)" required>
        <UInput
          v-model.number="durationMinutes"
          type="number"
          min="1"
          placeholder="30"
          icon="i-lucide-clock"
          class="w-full"
        />
      </UFormField>

      <UFormField name="price" label="Precio (MXN)">
        <UInput
          v-model.number="state.price"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          icon="i-lucide-dollar-sign"
          class="w-full"
        />
      </UFormField>
    </div>

    <!-- Visibilidad pública y cuota de catálogo -->
    <div class="border-t border-muted pt-4 space-y-3">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-highlighted">
              Mostrar en página pública
            </span>
            <UBadge
              :color="
                isAtPublicLimit && !state.is_public ? 'warning' : 'neutral'
              "
              variant="subtle"
              size="sm"
            >
              {{ publicCount }} / {{ MAX_PUBLIC_SERVICES }} públicos
            </UBadge>
          </div>
          <p class="text-xs text-muted">
            {{
              state.is_public
                ? "Visible en el catálogo público de tu negocio para que tus clientes lo consulten."
                : "Solo para uso interno al agendar citas en tu calendario."
            }}
          </p>
        </div>

        <USwitch
          :model-value="state.is_public"
          :disabled="!canTogglePublic && !state.is_public"
          @update:model-value="onTogglePublic"
        />
      </div>

      <!-- Alerta cuando se alcanza el límite de servicios públicos -->
      <UAlert
        v-if="isAtPublicLimit && !state.is_public"
        color="warning"
        variant="subtle"
        icon="i-lucide-alert-triangle"
        title="Límite alcanzado"
        :description="`Has alcanzado el límite de ${MAX_PUBLIC_SERVICES} servicios públicos activos. Desmarca otro servicio si deseas publicar este.`"
      />

      <!-- Selector de imagen (Solo disponible si el servicio es público) -->
      <div v-if="state.is_public" class="pt-2 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-highlighted">
            Foto del servicio (opcional)
          </span>
          <span class="text-[11px] text-muted">
            Compresión WebP automática
          </span>
        </div>

        <!-- Preview de la foto con botones por debajo para acceso móvil y escritorio -->
        <div v-if="imageUrl" class="space-y-2">
          <div
            class="relative rounded-xl overflow-hidden border border-muted aspect-video w-full bg-muted/20"
          >
            <img
              :src="imageUrl"
              alt="Foto del servicio"
              class="w-full h-full object-cover"
            />
            <div
              v-if="isUploadingImage"
              class="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white"
            >
              <UIcon
                name="i-lucide-loader-2"
                class="size-6 animate-spin text-primary"
              />
              <span class="text-xs font-medium">Optimizando y subiendo...</span>
            </div>
          </div>

          <!-- Botones de editar y eliminar debajo de la imagen (claros y accesibles en touch/mobile) -->
          <div class="flex items-center justify-between gap-2 pt-0.5">
            <span class="text-[11px] text-muted truncate">
              WebP optimizado
            </span>
            <div class="flex items-center gap-2 shrink-0">
              <UButton
                icon="i-lucide-image-up"
                size="sm"
                color="neutral"
                variant="outline"
                label="Cambiar foto"
                :loading="isUploadingImage"
                @click="onTriggerFileInput"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="sm"
                color="error"
                variant="ghost"
                label="Eliminar"
                :disabled="isUploadingImage"
                @click="onRemoveImage"
              />
            </div>
          </div>
        </div>

        <!-- Dropzone / Botón de carga si no hay imagen -->
        <div
          v-else
          class="border-2 border-dashed border-muted hover:border-primary/50 rounded-xl p-5 text-center transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/5"
          @click="onTriggerFileInput"
        >
          <div
            class="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
          >
            <UIcon
              :name="
                isUploadingImage ? 'i-lucide-loader-2' : 'i-lucide-image-plus'
              "
              class="size-5"
              :class="{ 'animate-spin': isUploadingImage }"
            />
          </div>
          <div class="text-xs space-y-0.5">
            <span class="font-medium text-highlighted">
              {{
                isUploadingImage
                  ? "Optimizando imagen..."
                  : "Selecciona una foto para este servicio"
              }}
            </span>
            <p class="text-muted text-[11px]">
              PNG, JPG o WebP. Se comprime automáticamente a WebP (&lt;150 KB).
            </p>
          </div>
          <UButton
            size="xs"
            color="primary"
            variant="subtle"
            icon="i-lucide-upload"
            label="Elegir archivo"
            class="mt-1"
            :loading="isUploadingImage"
            @click.stop="onTriggerFileInput"
          />
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          class="hidden"
          @change="onFileChange"
        />
      </div>
    </div>
  </UForm>
</template>
