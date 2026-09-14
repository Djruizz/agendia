<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { deleteAccountSchema, type DeleteAccountSchema } from "~/schemas/auth";

const supabase = useSupabaseClient();
const nuxtApp = useNuxtApp();
const toast = useToast();

const open = ref(false);
const state = reactive<DeleteAccountSchema>({ password: "" });
const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

const { mutateAsync: deleteAccount, isPending: deleting } = useDeleteAccount();

watch(open, (value) => {
  if (value) {
    state.password = "";
    formRef.value?.clearErrors();
  }
});

async function onConfirm(event: FormSubmitEvent<DeleteAccountSchema>) {
  try {
    await deleteAccount(event.data.password);
    nuxtApp.$queryClient.clear();
    await supabase.auth.signOut({ scope: "local" });
    return navigateTo("/", { external: true });
  } catch (err: any) {
    toast.add({
      title: "No se pudo eliminar la cuenta",
      description: err?.message ?? "Error inesperado",
      icon: "i-lucide-alert-circle",
      color: "error",
    });
  }
}
</script>

<template>
  <SettingsSection
    icon="i-lucide-triangle-alert"
    title="Zona de peligro"
    description="Acciones irreversibles sobre tu cuenta."
  >
    <SettingsRow
      label="Eliminar cuenta"
      description="Borra permanentemente tu cuenta, citas, clientes, servicios y página pública."
      wrap
    >
      <UButton
        label="Eliminar cuenta"
        icon="i-lucide-trash-2"
        color="error"
        variant="outline"
        @click="open = true"
      />
    </SettingsRow>

    <UModal
      v-model:open="open"
      title="Eliminar cuenta"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <div class="space-y-4">
          <div class="flex flex-col items-center text-center space-y-3 py-2">
            <div
              class="flex items-center justify-center size-16 rounded-full bg-error/10"
            >
              <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
            </div>
            <div class="space-y-2">
              <p class="text-base font-semibold text-highlighted">
                ¿Estás seguro de eliminar tu cuenta?
              </p>
              <p class="text-sm text-muted max-w-sm">
                Se eliminarán permanentemente tus citas, clientes, servicios,
                preferencias, tu página pública y tu logo. Esta acción no se
                puede deshacer.
              </p>
            </div>
          </div>
          <UForm
            id="delete-account-form"
            ref="formRef"
            :schema="deleteAccountSchema"
            :state="state"
            @submit="onConfirm"
          >
            <UFormField name="password" label="Confirma con tu contraseña" required>
              <UInput
                v-model="state.password"
                type="password"
                icon="i-lucide-lock"
                class="w-full"
                autocomplete="current-password"
              />
            </UFormField>
          </UForm>
        </div>
      </template>
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="ghost"
          :disabled="deleting"
          @click="close"
        />
        <UButton
          type="submit"
          form="delete-account-form"
          label="Eliminar mi cuenta"
          color="error"
          icon="i-lucide-trash-2"
          :loading="deleting"
        />
      </template>
    </UModal>
  </SettingsSection>
</template>
