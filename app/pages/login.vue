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

async function onSubmit(event: FormSubmitEvent<LoginSchema>) {
  loading.value = true;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: event.data.email,
      password: event.data.password,
    });
    if (error) {
      toast.add({
        title: "Error",
        description: "Credenciales invalidas",
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
  </UCard>
</template>
