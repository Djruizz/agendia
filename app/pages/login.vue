<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import { type LoginSchema, loginSchema } from "~/schemas/auth";
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "ejemplo@gmail.com",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Contraseña",
    placeholder: "********",
    required: true,
  },
];
const supabase = useSupabaseClient();
const route = useRoute();
const toast = useToast();
const loading = ref(false);

const unconfirmedEmail = ref("");
const resendLoading = ref(false);
const resendCooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown() {
  resendCooldown.value = 60;
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer);
});

async function resendConfirmation() {
  if (
    resendCooldown.value > 0 ||
    resendLoading.value ||
    !unconfirmedEmail.value
  )
    return;
  resendLoading.value = true;
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: unconfirmedEmail.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    if (error) {
      const feedback = describeAuthError(error);
      toast.add({
        title: feedback.title,
        description: feedback.description,
        icon: feedback.icon,
        color: feedback.color,
      });
      return;
    }
    toast.add({
      title: "Correo reenviado",
      description: "Revisa tu bandeja de entrada y spam",
      icon: "i-lucide-mail-check",
      color: "success",
    });
    startCooldown();
  } finally {
    resendLoading.value = false;
  }
}

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  loading.value = true;
  unconfirmedEmail.value = "";
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: event.data.email,
      password: event.data.password,
    });
    if (error) {
      const feedback = describeAuthError(error);
      if (feedback.code === "email-not-confirmed") {
        unconfirmedEmail.value = event.data.email;
      }
      toast.add({
        title: feedback.title,
        description: feedback.description,
        icon: feedback.icon,
        color: feedback.color,
      });
      return;
    }
    toast.add({
      title: "Sesión iniciada",
      description: "Bienvenido de nuevo",
      icon: "i-lucide-circle-check",
      color: "success",
    });
    const redirect = route.query.redirect;
    const safeRedirect =
      typeof redirect === "string" &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
        ? redirect
        : "/workspace";
    return navigateTo(safeRedirect);
  } finally {
    loading.value = false;
  }
}
</script>
<template>
  <UCard class="max-w-lg mx-auto">
    <UAuthForm
      :fields="fields"
      title="Iniciar Sesión"
      description="Ingresa con tu correo electrónico y contraseña"
      icon="i-lucide-user"
      :schema="loginSchema"
      :loading="loading"
      @submit="onSubmit"
    >
      <template #footer>
        <div class="space-y-2 text-center">
          <p class="text-sm text-muted">
            <ULink to="/forgot-password" class="text-primary font-medium"
              >¿Olvidaste tu contraseña?</ULink
            >
          </p>
          <p class="text-sm text-muted">
            ¿No tienes cuenta?
            <ULink to="/register" class="text-primary font-medium"
              >Crear cuenta</ULink
            >
          </p>
          <p class="text-xs text-muted">
            Al usar Agendia aceptas los
            <ULink to="/terminos" class="text-primary">Términos</ULink> y el
            <ULink to="/privacidad" class="text-primary"
              >Aviso de privacidad</ULink
            >
          </p>
        </div>
      </template>
    </UAuthForm>
    <div v-if="unconfirmedEmail" class="mt-4 space-y-3">
      <UAlert
        icon="i-lucide-mail-warning"
        color="warning"
        variant="subtle"
        title="Email no confirmado"
        description="Tu cuenta existe pero el correo no ha sido confirmado. Revisa tu bandeja de entrada o spam."
      />
      <UButton
        block
        :label="
          resendCooldown > 0
            ? `Reenviar correo (${resendCooldown}s)`
            : 'Reenviar correo de confirmación'
        "
        :icon="resendLoading ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'"
        :loading="resendLoading"
        :disabled="resendCooldown > 0"
        color="neutral"
        variant="outline"
        @click="resendConfirmation"
      />
    </div>
  </UCard>
</template>
