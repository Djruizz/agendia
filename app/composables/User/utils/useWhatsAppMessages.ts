import {
  DEFAULT_WHATSAPP_CONFIRMATION,
  DEFAULT_WHATSAPP_FOLLOW_UP,
  WHATSAPP_VARIABLES,
  type WhatsAppVariable,
} from "~/schemas/preferences";

export type WhatsAppTemplateVars = Record<WhatsAppVariable, string>;

const TEMPLATE_TOKEN_PATTERN = new RegExp(
  `\\{\\{\\s*(${WHATSAPP_VARIABLES.join("|")})\\s*\\}\\}`,
  "g",
);

export const renderWhatsAppTemplate = (
  template: string,
  vars: WhatsAppTemplateVars,
) =>
  template.replace(
    TEMPLATE_TOKEN_PATTERN,
    (_match: string, variable: WhatsAppVariable) => vars[variable] ?? "",
  );

export const useWhatsAppMessages = () => {
  const { data } = useUserPreferences();

  const whatsappMessages = computed(() => ({
    follow_up:
      data.value?.whatsapp_follow_up_message ?? DEFAULT_WHATSAPP_FOLLOW_UP,
    confirmation:
      data.value?.whatsapp_confirmation_message ??
      DEFAULT_WHATSAPP_CONFIRMATION,
  }));

  return { whatsappMessages };
};
