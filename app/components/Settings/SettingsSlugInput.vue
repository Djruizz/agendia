<script setup lang="ts">
const props = defineProps<{
  currentSlug: string;
}>();

const toast = useToast();

const slug = ref(props.currentSlug);

const { data: slugCheck, isFetching: slugChecking } = useSlugAvailability(slug);

const updateProfile = useUpdateBusinessProfile();

const isDirty = computed(() => slug.value !== props.currentSlug);

const slugMatchesCheck = computed(
  () => slugCheck.value?.slug === slug.value,
);

const verifying = computed(
  () => slugChecking.value || !slugMatchesCheck.value,
);

const canSave = computed(
  () =>
    isDirty.value &&
    !verifying.value &&
    slugCheck.value?.available === true,
);

watch(
  () => props.currentSlug,
  (v) => {
    slug.value = v;
  },
);

async function save() {
  if (!canSave.value) return;
  try {
    await updateProfile.mutateAsync({ slug: slug.value });
    toast.add({
      icon: "i-lucide-check",
      title: "Enlace público actualizado",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo guardar el enlace",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <UInput
        v-model="slug"
        placeholder="mi-studio"
        icon="i-lucide-link"
        autocomplete="off"
        class="flex-1"
      >
        <template #trailing>
          <UIcon
            v-if="verifying"
            name="i-lucide-loader-circle"
            class="size-4 animate-spin text-muted"
          />
          <UIcon
            v-else-if="slugCheck?.available"
            name="i-lucide-check-circle"
            class="size-4 text-success"
          />
          <UIcon
            v-else-if="slugCheck && !slugCheck.available"
            name="i-lucide-circle-x"
            class="size-4 text-error"
          />
        </template>
      </UInput>
      <UButton
        label="Guardar"
        color="primary"
        size="md"
        :disabled="!canSave"
        :loading="updateProfile.isPending.value"
        @click="save"
      />
    </div>
    <p class="text-xs text-muted">
      Tu página pública estará en /p/{{ slug || "tu-enlace" }}
    </p>
  </div>
</template>