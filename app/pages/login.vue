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
  if (resendCooldown.value > 0 || resendLoading.value || !unconfirmedEmail.value) return;
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
      toast.add({
        title: "Error",
        description: "No se pudo reenviar el correo",
        icon: "i-lucide-circle-x",
        color: "error",
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
      if (error.message.includes("not confirmed") || error.message.includes("Email not confirmed")) {
        unconfirmedEmail.value = event.data.email;
        toast.add({
          title: "Email no confirmado",
          description: "Confirma tu correo antes de iniciar sesión",
          icon: "i-lucide-mail-warning",
          color: "warning",
        });
        return;
      }
      toast.add({
        title: "Error",
        description: "Credenciales inválidas",
        icon: "i-lucide-circle-x",
        color: "error",
      });
      return;
    }
    toast.add({
      title: "Success",
      description: "Login exitoso",
      icon: "i-lucide-circle-check",
      color: "success",
    });
    const redirect = route.query.redirect as string | undefined;
    return navigateTo(redirect || "/workspace");
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
          <p class="text-sm text-(--ui-text-muted)">
            <ULink to="/forgot-password" class="text-primary font-medium"
              >¿Olvidaste tu contraseña?</ULink
            >
          </p>
          <p class="text-sm text-(--ui-text-muted)">
            ¿No tienes cuenta?
            <ULink to="/register" class="text-primary font-medium"
              >Crear cuenta</ULink
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
