<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import { type ForgotPasswordSchema, forgotPasswordSchema } from "~/schemas/auth";

definePageMeta({
  layout: "auth",
});

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "ejemplo@gmail.com",
    required: true,
  },
];

const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(false);
const sent = ref(false);

async function onSubmit(event: FormSubmitEvent<ForgotPasswordSchema>) {
  loading.value = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      event.data.email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (error) {
      toast.add({
        title: "Error",
        description: "No se pudo enviar el correo de recuperación",
        icon: "i-lucide-circle-x",
        color: "error",
      });
      return;
    }

    sent.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UCard class="max-w-lg mx-auto">
    <template v-if="!sent">
      <UAuthForm
        :fields="fields"
        title="Recuperar contraseña"
        description="Te enviaremos un enlace para restablecer tu contraseña"
        icon="i-lucide-key-round"
        :schema="forgotPasswordSchema"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #footer>
          <p class="text-sm text-(--ui-text-muted) text-center">
            ¿Recordaste tu contraseña?
            <ULink to="/login" class="text-primary font-medium"
              >Iniciar sesión</ULink
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
          <h2 class="text-lg font-semibold text-(--ui-text)">
            Revisa tu correo
          </h2>
          <p class="text-sm text-(--ui-text-muted)">
            Te enviamos un enlace para restablecer tu contraseña. Si no lo
            encuentras, revisa tu carpeta de spam.
          </p>
        </div>
        <UButton
          to="/login"
          block
          label="Volver a iniciar sesión"
          icon="i-lucide-log-in"
        />
      </div>
    </template>
  </UCard>
</template>
