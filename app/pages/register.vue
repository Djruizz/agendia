<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import { type RegisterSchema, registerSchema } from "~/schemas/auth";

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
  {
    name: "confirmPassword",
    type: "password",
    label: "Confirmar contraseña",
    placeholder: "********",
    required: true,
  },
  {
    name: "terms",
    type: "checkbox",
    defaultValue: false,
  },
];

const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(false);
const registered = ref(false);
const registeredEmail = ref("");

const RESEND_COOLDOWN = 60;
const resendCooldown = ref(0);
const resendLoading = ref(false);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;

function startCooldown() {
  resendCooldown.value = RESEND_COOLDOWN;
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
  if (resendCooldown.value > 0 || resendLoading.value || !registeredEmail.value)
    return;
  resendLoading.value = true;
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: registeredEmail.value,
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

async function onSubmit(event: FormSubmitEvent<RegisterSchema>) {
  loading.value = true;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: event.data.email,
      password: event.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          accepted_terms_at: new Date().toISOString(),
          terms_version: SITE.termsVersion,
        },
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

    if (data.session) {
      toast.add({
        title: "Cuenta creada",
        description: "¡Bienvenido a Agendia!",
        icon: "i-lucide-circle-check",
        color: "success",
      });
      return navigateTo("/workspace");
    }

    registeredEmail.value = event.data.email;
    registered.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UCard class="max-w-lg mx-auto">
    <template v-if="!registered">
      <UAuthForm
        :fields="fields"
        title="Crear cuenta"
          description="Regístrate para empezar a gestionar tu agenda (por ahora requiere invitación)"
        icon="i-lucide-user-plus"
        :schema="registerSchema"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #terms-field="{ state }">
          <UCheckbox v-model="state.terms" class="mt-2">
            <template #label>
              <span class="text-sm text-muted">
                Acepto los
                <ULink
                  to="/terminos"
                  class="text-primary font-medium"
                  inactive-class="text-primary"
                  >Términos de uso</ULink
                >
                y el
                <ULink
                  to="/privacidad"
                  class="text-primary font-medium"
                  inactive-class="text-primary"
                  >Aviso de privacidad</ULink
                >
              </span>
            </template>
          </UCheckbox>
        </template>
        <template #footer>
          <p class="text-sm text-muted text-center">
            ¿Ya tienes cuenta?
            <ULink to="/login" class="text-primary font-medium"
              >Inicia sesión</ULink
            >
          </p>
        </template>
      </UAuthForm>
    </template>

    <template v-else>
      <div class="text-center py-6 space-y-4">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-mail-check" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-default">Revisa tu correo</h2>
          <p class="text-sm text-muted">
            Te enviamos un enlace de confirmación. Haz clic en él para activar
            tu cuenta y empezar a usar Agendia.
          </p>
        </div>
        <UButton
          to="/login"
          block
          label="Ir a iniciar sesión"
          icon="i-lucide-log-in"
        />
        <UButton
          block
          :label="
            resendCooldown > 0
              ? `Reenviar correo (${resendCooldown}s)`
              : 'Reenviar correo de confirmación'
          "
          :icon="
            resendLoading ? 'i-lucide-loader-circle' : 'i-lucide-refresh-cw'
          "
          :loading="resendLoading"
          :disabled="resendCooldown > 0"
          color="neutral"
          variant="outline"
          @click="resendConfirmation"
        />
      </div>
    </template>
  </UCard>
</template>
