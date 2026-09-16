<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import { type ResetPasswordSchema, resetPasswordSchema } from "~/schemas/auth";

definePageMeta({
  layout: "auth",
});

const fields: AuthFormField[] = [
  {
    name: "password",
    type: "password",
    label: "Nueva contraseña",
    placeholder: "********",
    required: true,
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirmar contraseña",
    placeholder: "********",
    required: true,
  },
];

const route = useRoute();
const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(false);

const linkStatus = ref<"loading" | "ready" | "error">(
  route.query.token_hash ? "loading" : "ready",
);
const linkError = ref("");

onMounted(async () => {
  const tokenHash = route.query.token_hash as string | undefined;
  if (!tokenHash) return;

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });
  if (error) {
    linkStatus.value = "error";
    linkError.value =
      error.message.includes("expired") || error.message.includes("used")
        ? "El enlace expiró o ya fue usado. Solicita uno nuevo."
        : "No se pudo verificar el enlace de recuperación.";
    return;
  }
  linkStatus.value = "ready";
});

async function onSubmit(event: FormSubmitEvent<ResetPasswordSchema>) {
  loading.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: event.data.password,
    });

    if (error) {
      toast.add({
        title: "Error",
        description: "No se pudo actualizar la contraseña",
        icon: "i-lucide-circle-x",
        color: "error",
      });
      return;
    }

    toast.add({
      title: "Contraseña actualizada",
      description: "Tu contraseña se actualizó correctamente",
      icon: "i-lucide-circle-check",
      color: "success",
    });
    return navigateTo("/workspace");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UCard class="max-w-lg mx-auto">
    <div v-if="linkStatus === 'loading'" class="text-center py-6 space-y-4">
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-primary mx-auto"
      />
      <p class="text-sm text-muted">Verificando tu enlace...</p>
    </div>

    <div v-else-if="linkStatus === 'error'" class="text-center py-6 space-y-4">
      <div
        class="inline-flex items-center justify-center size-14 rounded-full bg-error/10 text-error"
      >
        <UIcon name="i-lucide-circle-x" class="size-7" />
      </div>
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-default">Enlace inválido</h2>
        <p class="text-sm text-muted">{{ linkError }}</p>
      </div>
      <UButton
        to="/forgot-password"
        block
        label="Solicitar uno nuevo"
        icon="i-lucide-key-round"
      />
    </div>

    <UAuthForm
      v-else
      :fields="fields"
      title="Nueva contraseña"
      description="Define una nueva contraseña para tu cuenta"
      icon="i-lucide-lock-keyhole"
      :schema="resetPasswordSchema"
      :loading="loading"
      @submit="onSubmit"
    >
      <template #footer>
        <p class="text-sm text-muted text-center">
          <ULink to="/login" class="text-primary font-medium"
            >Volver a iniciar sesión</ULink
          >
        </p>
      </template>
    </UAuthForm>
  </UCard>
</template>
