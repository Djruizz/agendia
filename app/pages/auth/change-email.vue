<script setup lang="ts">
definePageMeta({
  layout: "auth",
});

const route = useRoute();
const supabase = useSupabaseClient();
const toast = useToast();

const status = ref<"loading" | "success" | "error">("loading");
const errorMessage = ref("");

function fail(message: string) {
  status.value = "error";
  errorMessage.value = message;
}

function succeed() {
  status.value = "success";
  toast.add({
    title: "Email actualizado",
    description: "Tu correo se actualizó correctamente",
    icon: "i-lucide-circle-check",
    color: "success",
  });
  return navigateTo("/workspace", { replace: true });
}

onMounted(async () => {
  try {
    const urlError = route.query.error as string | undefined;
    const urlErrorDescription = route.query.error_description as
      | string
      | undefined;
    if (urlError) {
      const desc = urlErrorDescription ?? urlError;
      fail(
        desc.toLowerCase().includes("expired") ||
          desc.toLowerCase().includes("used")
          ? "El enlace expiró o ya fue usado. Solicita uno nuevo."
          : `No se pudo confirmar tu nuevo correo: ${desc}`,
      );
      return;
    }

    const tokenHash = route.query.token_hash as string | undefined;
    if (!tokenHash) {
      fail("Enlace de confirmación inválido o ya utilizado.");
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email_change",
    });
    if (error) {
      fail(
        error.message.includes("expired") || error.message.includes("used")
          ? "El enlace expiró o ya fue usado. Solicita uno nuevo desde Configuración."
          : "No se pudo confirmar tu nuevo correo.",
      );
      return;
    }

    await succeed();
  } catch {
    fail("Ocurrió un error inesperado al confirmar tu correo.");
  }
});
</script>

<template>
  <UCard class="max-w-lg mx-auto">
    <div class="text-center py-6 space-y-4">
      <template v-if="status === 'loading'">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-primary mx-auto"
        />
        <p class="text-sm text-muted">Confirmando tu nuevo correo...</p>
      </template>

      <template v-else-if="status === 'success'">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-circle-check" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-default">Email actualizado</h2>
          <p class="text-sm text-muted">Redirigiéndote a tu workspace...</p>
        </div>
      </template>

      <template v-else-if="status === 'error'">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-error/10 text-error"
        >
          <UIcon name="i-lucide-circle-x" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-default">
            No se pudo confirmar
          </h2>
          <p class="text-sm text-muted">{{ errorMessage }}</p>
        </div>
        <UButton
          to="/workspace"
          block
          label="Ir a Agendia"
          icon="i-lucide-calendar"
        />
      </template>
    </div>
  </UCard>
</template>
