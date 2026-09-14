import { z } from "zod";
import { WEEKS_FOR_REMEMBER } from "~/composables/Appointment/utils/AppointmentStatus";

export const COLOR_THEMES = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export const TIME_FORMATS = ["12h", "24h"] as const;

export const WHATSAPP_VARIABLES = [
  "cliente",
  "servicio",
  "fecha",
  "hora",
] as const;

export const DEFAULT_WHATSAPP_FOLLOW_UP =
  "Hola {{cliente}}, te escribo para hacer seguimiento de tu cita del {{fecha}}. ¿Te gustaría agendar una nueva?";

export const DEFAULT_WHATSAPP_CONFIRMATION =
  "Hola {{cliente}}! Te recordamos tu cita de {{servicio}} el {{fecha}} a las {{hora}}. Por favor confirma tu asistencia. ¡Gracias!";

export const whatsappMessageSchema = z
  .string()
  .trim()
  .min(1, "El mensaje no puede estar vacío")
  .max(500, "Máximo 500 caracteres");

export const UserPreferencesSchema = z
  .object({
    color_theme: z.enum(COLOR_THEMES).default("pink"),
    time_format: z.enum(TIME_FORMATS).default("24h"),
    weeks_to_follow_up: z
      .number()
      .int()
      .min(1, "Debe ser al menos 1 semana")
      .max(52, "Debe ser 52 semanas o menos")
      .default(WEEKS_FOR_REMEMBER),
    whatsapp_follow_up_message: whatsappMessageSchema.default(
      DEFAULT_WHATSAPP_FOLLOW_UP,
    ),
    whatsapp_confirmation_message: whatsappMessageSchema.default(
      DEFAULT_WHATSAPP_CONFIRMATION,
    ),
  })
  .strict();

export type UserPreferencesSettings = z.infer<typeof UserPreferencesSchema>;
export type ColorTheme = UserPreferencesSettings["color_theme"];
export type TimeFormat = UserPreferencesSettings["time_format"];
export type WeeksToFollowUp = UserPreferencesSettings["weeks_to_follow_up"];
export type WhatsAppVariable = (typeof WHATSAPP_VARIABLES)[number];