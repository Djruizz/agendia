<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "guest",
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
          : `No se pudo confirmar tu cuenta: ${desc}`,
      );
      return;
    }

    const code = route.query.code as string | undefined;
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        fail(
          error.message.includes("expired") ||
            error.message.includes("used")
            ? "El enlace expiró o ya fue usado. Solicita uno nuevo."
            : "No se pudo confirmar tu cuenta.",
        );
        return;
      }

      status.value = "success";
      toast.add({
        title: "Cuenta confirmada",
        description: "¡Bienvenido a Agendia!",
        icon: "i-lucide-circle-check",
        color: "success",
      });
      await navigateTo("/workspace", { replace: true });
      return;
    }

    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      fail("Enlace de confirmación inválido o ya utilizado.");
      return;
    }

    status.value = "success";
    toast.add({
      title: "Cuenta confirmada",
      description: "¡Bienvenido a Agendia!",
      icon: "i-lucide-circle-check",
      color: "success",
    });
    await navigateTo("/workspace", { replace: true });
  } catch {
    fail("Ocurrió un error inesperado al confirmar tu cuenta.");
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
        <p class="text-sm text-(--ui-text-muted)">Confirmando tu cuenta...</p>
      </template>

      <template v-else-if="status === 'success'">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-circle-check" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-(--ui-text)">
            Cuenta confirmada
          </h2>
          <p class="text-sm text-(--ui-text-muted)">
            Redirigiéndote a tu workspace...
          </p>
        </div>
      </template>

      <template v-else-if="status === 'error'">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-error/10 text-error"
        >
          <UIcon name="i-lucide-circle-x" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-(--ui-text)">
            No se pudo confirmar
          </h2>
          <p class="text-sm text-(--ui-text-muted)">{{ errorMessage }}</p>
        </div>
        <UButton
          to="/login"
          block
          label="Ir a iniciar sesión"
          icon="i-lucide-log-in"
        />
      </template>
    </div>
  </UCard>
</template>
