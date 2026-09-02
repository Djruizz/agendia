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

const supabase = useSupabaseClient();
const toast = useToast();
const loading = ref(false);

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
    <UAuthForm
      :fields="fields"
      title="Nueva contraseña"
      description="Define una nueva contraseña para tu cuenta"
      icon="i-lucide-lock-keyhole"
      :schema="resetPasswordSchema"
      :loading="loading"
      @submit="onSubmit"
    >
      <template #footer>
        <p class="text-sm text-(--ui-text-muted) text-center">
          <ULink to="/login" class="text-primary font-medium"
            >Volver a iniciar sesión</ULink
          >
        </p>
      </template>
    </UAuthForm>
  </UCard>
</template>
