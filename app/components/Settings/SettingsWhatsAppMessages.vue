<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";
import {
  DEFAULT_WHATSAPP_CONFIRMATION,
  DEFAULT_WHATSAPP_FOLLOW_UP,
  WHATSAPP_VARIABLES,
  whatsappMessageSchema,
} from "~/schemas/preferences";
import { WHATSAPP_VARIABLE_LABELS } from "~/types/preferences";
import {
  renderWhatsAppTemplate,
  type WhatsAppTemplateVars,
} from "~/composables/User/utils/useWhatsAppMessages";

const toast = useToast();

const { data: preferences } = useUserPreferences();
const updatePrefs = useUpdateUserPreferences();
const { formatDate, formatTime } = useDateUtils();

const state = reactive({
  follow_up: DEFAULT_WHATSAPP_FOLLOW_UP,
  confirmation: DEFAULT_WHATSAPP_CONFIRMATION,
});

const initialized = ref(false);

watch(
  () => preferences.value,
  (val) => {
    if (!val || initialized.value) return;
    initialized.value = true;
    state.follow_up = val.whatsapp_follow_up_message;
    state.confirmation = val.whatsapp_confirmation_message;
  },
  { immediate: true },
);

const original = computed(() => ({
  follow_up:
    preferences.value?.whatsapp_follow_up_message ??
    DEFAULT_WHATSAPP_FOLLOW_UP,
  confirmation:
    preferences.value?.whatsapp_confirmation_message ??
    DEFAULT_WHATSAPP_CONFIRMATION,
}));

const isDirty = computed(
  () =>
    state.follow_up !== original.value.follow_up ||
    state.confirmation !== original.value.confirmation,
);

const formSchema = z.object({
  follow_up: whatsappMessageSchema,
  confirmation: whatsappMessageSchema,
});

type WhatsAppMessagesForm = z.infer<typeof formSchema>;
type MessageField = keyof WhatsAppMessagesForm;

const variableChips = WHATSAPP_VARIABLES.map((variable) => ({
  variable,
  token: `{{${variable}}}`,
  label: WHATSAPP_VARIABLE_LABELS[variable],
}));

const sampleDate = new Date();
sampleDate.setHours(16, 0, 0, 0);

const sampleVars = computed<WhatsAppTemplateVars>(() => ({
  cliente: "María",
  servicio: "Corte de cabello",
  fecha: formatDate(sampleDate, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  hora: formatTime(sampleDate, { hour: "2-digit", minute: "2-digit" }),
}));

const followUpPreview = computed(() =>
  renderWhatsAppTemplate(state.follow_up, sampleVars.value),
);

const confirmationPreview = computed(() =>
  renderWhatsAppTemplate(state.confirmation, sampleVars.value),
);

const followUpWrap = ref<HTMLElement | null>(null);
const confirmationWrap = ref<HTMLElement | null>(null);

function insertToken(field: MessageField, token: string) {
  const value = state[field];
  const wrap =
    field === "follow_up" ? followUpWrap.value : confirmationWrap.value;
  const textarea = wrap?.querySelector("textarea");

  if (textarea instanceof HTMLTextAreaElement) {
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? start;
    state[field] = value.slice(0, start) + token + value.slice(end);
    void nextTick(() => {
      const pos = start + token.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  } else {
    state[field] = value + token;
  }
}

function resetMessage(field: MessageField) {
  state[field] =
    field === "follow_up"
      ? DEFAULT_WHATSAPP_FOLLOW_UP
      : DEFAULT_WHATSAPP_CONFIRMATION;
}

async function saveMessages(event: FormSubmitEvent<WhatsAppMessagesForm>) {
  try {
    const data = await updatePrefs.mutateAsync({
      whatsapp_follow_up_message: event.data.follow_up.trim(),
      whatsapp_confirmation_message: event.data.confirmation.trim(),
    });
    state.follow_up = data.whatsapp_follow_up_message;
    state.confirmation = data.whatsapp_confirmation_message;
    toast.add({
      icon: "i-lucide-check",
      title: "Mensajes de WhatsApp actualizados",
      color: "success",
    });
  } catch (err: any) {
    toast.add({
      icon: "i-lucide-x",
      title: "No se pudieron guardar los mensajes",
      description: err?.message ?? "Error inesperado",
      color: "error",
    });
  }
}
</script>

<template>
  <SettingsSection
    icon="i-lucide-message-circle"
    title="Mensajes de WhatsApp"
    description="Personaliza los mensajes que se envían a tus clientes por WhatsApp."
  >
    <p class="text-xs text-muted">
      Haz clic en una variable para insertarla en el mensaje. Los textos entre
      llaves se reemplazan automáticamente al enviar el mensaje.
    </p>

    <UForm
      :schema="formSchema"
      :state="state"
      class="flex flex-col gap-6"
      @submit="saveMessages"
    >
      <div class="flex flex-col gap-2">
        <div>
          <p class="text-sm font-semibold text-highlighted">
            Mensaje de recordatorio
          </p>
          <p class="text-xs text-muted">
            Se envía con el botón "Enviar recordatorio" de una cita completada.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            v-for="chip in variableChips"
            :key="chip.variable"
            :label="chip.token"
            :title="chip.label"
            size="xs"
            variant="subtle"
            color="neutral"
            class="font-mono"
            @click="insertToken('follow_up', chip.token)"
          />
        </div>

        <UFormField name="follow_up">
          <div ref="followUpWrap" class="w-full">
            <UTextarea
              v-model="state.follow_up"
              :rows="4"
              autoresize
              :maxrows="8"
              class="w-full"
            />
          </div>
        </UFormField>

        <div class="flex items-center justify-between">
          <p
            class="text-xs"
            :class="state.follow_up.length > 500 ? 'text-error' : 'text-muted'"
          >
            {{ state.follow_up.length }}/500
          </p>
          <UButton
            label="Restaurar"
            icon="i-lucide-rotate-ccw"
            size="xs"
            color="neutral"
            variant="ghost"
            :disabled="state.follow_up === DEFAULT_WHATSAPP_FOLLOW_UP"
            @click="resetMessage('follow_up')"
          />
        </div>

        <div
          class="rounded-lg bg-elevated/50 ring-1 ring-default p-3 flex flex-col gap-2"
        >
          <p class="text-xs font-semibold text-muted">Vista previa</p>
          <div class="rounded-xl bg-primary/10 px-3 py-2">
            <p
              v-if="followUpPreview"
              class="text-sm whitespace-pre-wrap break-words"
            >
              {{ followUpPreview }}
            </p>
            <p v-else class="text-sm text-muted italic">
              El mensaje se verá aquí…
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div>
          <p class="text-sm font-semibold text-highlighted">
            Mensaje de confirmación
          </p>
          <p class="text-xs text-muted">
            Se envía con el botón "Confirmar por WhatsApp" de una cita pendiente.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UButton
            v-for="chip in variableChips"
            :key="chip.variable"
            :label="chip.token"
            :title="chip.label"
            size="xs"
            variant="subtle"
            color="neutral"
            class="font-mono"
            @click="insertToken('confirmation', chip.token)"
          />
        </div>

        <UFormField name="confirmation">
          <div ref="confirmationWrap" class="w-full">
            <UTextarea
              v-model="state.confirmation"
              :rows="4"
              autoresize
              :maxrows="8"
              class="w-full"
            />
          </div>
        </UFormField>

        <div class="flex items-center justify-between">
          <p
            class="text-xs"
            :class="
              state.confirmation.length > 500 ? 'text-error' : 'text-muted'
            "
          >
            {{ state.confirmation.length }}/500
          </p>
          <UButton
            label="Restaurar"
            icon="i-lucide-rotate-ccw"
            size="xs"
            color="neutral"
            variant="ghost"
            :disabled="state.confirmation === DEFAULT_WHATSAPP_CONFIRMATION"
            @click="resetMessage('confirmation')"
          />
        </div>

        <div
          class="rounded-lg bg-elevated/50 ring-1 ring-default p-3 flex flex-col gap-2"
        >
          <p class="text-xs font-semibold text-muted">Vista previa</p>
          <div class="rounded-xl bg-primary/10 px-3 py-2">
            <p
              v-if="confirmationPreview"
              class="text-sm whitespace-pre-wrap break-words"
            >
              {{ confirmationPreview }}
            </p>
            <p v-else class="text-sm text-muted italic">
              El mensaje se verá aquí…
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <UButton
          type="submit"
          label="Guardar cambios"
          icon="i-lucide-check"
          color="primary"
          :disabled="!isDirty"
          :loading="updatePrefs.isPending.value"
        />
      </div>
    </UForm>
  </SettingsSection>
</template>
