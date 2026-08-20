<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";
import { type LoginSchema, loginSchema } from "~/schemas/auth";
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
  {
    name: "password",
    type: "password",
    label: "Contraseña",
    placeholder: "********",
    required: true,
  },
];
const supabase = useSupabaseClient();
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
      title="Iniciar Sesión"
      description="Ingresa con tu correo electrónico y contraseña"
      icon="i-lucide-user"
      :schema="loginSchema"
      :loading="loading"
      @submit="onSubmit"
    >
    </UAuthForm>
  </UCard>
</template>
