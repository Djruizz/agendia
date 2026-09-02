<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import {
  changeEmailSchema,
  changePasswordSchema,
  type ChangeEmailSchema,
  type ChangePasswordSchema,
} from "~/schemas/auth";

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const toast = useToast();

const emailModalOpen = ref(false);
const passwordModalOpen = ref(false);

const currentEmail = computed(() => user.value?.email ?? "");

const emailState = reactive<ChangeEmailSchema>({ email: "" });
const emailSubmitting = ref(false);
const emailFormRef = useTemplateRef<{ clearErrors: () => void }>("emailFormRef");

watch(
  () => emailModalOpen.value,
  (open) => {
    if (open) {
      emailState.email = currentEmail.value;
      emailFormRef.value?.clearErrors();
    }
  },
);

async function saveEmail(event: FormSubmitEvent<ChangeEmailSchema>) {
  emailSubmitting.value = true;
  try {
    if (event.data.email === currentEmail.value) {
      emailModalOpen.value = false;
      toast.add({
        title: "Ese ya es tu email actual",
        icon: "i-lucide-info",
        color: "warning",
      });
      return;
    }
    const { error } = await supabase.auth.updateUser({
      email: event.data.email,
    });
    if (error) throw error;
    emailModalOpen.value = false;
    toast.add({
      icon: "i-lucide-check",
      title: "Solicitud enviada",
      description: "Revisa el correo nuevo para confirmar el cambio.",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo cambiar el email",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  } finally {
    emailSubmitting.value = false;
  }
}

const passwordState = reactive<ChangePasswordSchema>({
  password: "",
  confirmPassword: "",
});
const passwordSubmitting = ref(false);
const passwordFormRef = useTemplateRef<{ clearErrors: () => void }>(
  "passwordFormRef",
);

watch(
  () => passwordModalOpen.value,
  (open) => {
    if (open) {
      passwordState.password = "";
      passwordState.confirmPassword = "";
      passwordFormRef.value?.clearErrors();
    }
  },
);

async function savePassword(event: FormSubmitEvent<ChangePasswordSchema>) {
  passwordSubmitting.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: event.data.password,
    });
    if (error) throw error;
    passwordModalOpen.value = false;
    toast.add({
      icon: "i-lucide-check",
      title: "Contraseña actualizada",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudo cambiar la contraseña",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  } finally {
    passwordSubmitting.value = false;
  }
}

const signOutLoading = ref(false);

async function onSignOut() {
  signOutLoading.value = true;
  try {
    await supabase.auth.signOut();
    await navigateTo("/login", { external: true });
  } catch {
    // navigateTo external makes the page reload anyway
  } finally {
    signOutLoading.value = false;
  }
}
</script>

<template>
  <SettingsSection
    icon="i-lucide-shield"
    title="Cuenta y seguridad"
    description="Administra tu email, contraseña y sesión."
  >
    <SettingsRow
      label="Email"
      :description="currentEmail || 'Sin email'"
    >
      <UButton
        label="Cambiar"
        color="neutral"
        variant="outline"
        @click="emailModalOpen = true"
      />
    </SettingsRow>

    <SettingsRow
      label="Contraseña"
      description="Cambia tu contraseña periódicamente."
    >
      <UButton
        label="Cambiar"
        color="neutral"
        variant="outline"
        @click="passwordModalOpen = true"
      />
    </SettingsRow>

    <SettingsRow
      label="Sesión"
      description="Cierra sesión en este navegador."
    >
      <UButton
        label="Cerrar sesión"
        icon="i-lucide-log-out"
        color="error"
        variant="ghost"
        :loading="signOutLoading"
        @click="onSignOut"
      />
    </SettingsRow>

    <UModal
      v-model:open="emailModalOpen"
      title="Cambiar email"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <UForm
          id="change-email-form"
          ref="emailFormRef"
          :schema="changeEmailSchema"
          :state="emailState"
          @submit="saveEmail"
        >
          <UFormField name="email" label="Nuevo email" required>
            <UInput
              v-model="emailState.email"
              type="email"
              icon="i-lucide-mail"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </template>
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="ghost"
          @click="close"
        />
        <UButton
          type="submit"
          form="change-email-form"
          label="Enviar"
          color="primary"
          :loading="emailSubmitting"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="passwordModalOpen"
      title="Cambiar contraseña"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <UForm
          id="change-password-form"
          ref="passwordFormRef"
          :schema="changePasswordSchema"
          :state="passwordState"
          class="space-y-4"
          @submit="savePassword"
        >
          <UFormField name="password" label="Nueva contraseña" required>
            <UInput
              v-model="passwordState.password"
              type="password"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>
          <UFormField name="confirmPassword" label="Confirmar" required>
            <UInput
              v-model="passwordState.confirmPassword"
              type="password"
              icon="i-lucide-lock"
              class="w-full"
            />
          </UFormField>
        </UForm>
      </template>
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="ghost"
          @click="close"
        />
        <UButton
          type="submit"
          form="change-password-form"
          label="Guardar"
          color="primary"
          :loading="passwordSubmitting"
        />
      </template>
    </UModal>
  </SettingsSection>
</template>