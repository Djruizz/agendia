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

export const LOGO_PATH_REGEX = /^logos\/[a-f0-9-]{36}\/logo-[a-z0-9_-]+\.(png|jpg|jpeg|webp|svg)$/i;

export const UserPreferencesSchema = z
  .object({
    color_theme: z.enum(COLOR_THEMES).default("pink"),
    time_format: z.enum(TIME_FORMATS).default("24h"),
    weeks_to_follow_up: z
      .number()
      .int()
      .min(1)
      .max(52)
      .default(WEEKS_FOR_REMEMBER),
    business_logo_path: z
      .string()
      .regex(LOGO_PATH_REGEX, "Path de logo inválido")
      .nullable()
      .default(null),
  })
  .strict();

export type UserPreferencesSettings = z.infer<typeof UserPreferencesSchema>;
export type ColorTheme = UserPreferencesSettings["color_theme"];
export type TimeFormat = UserPreferencesSettings["time_format"];
export type WeeksToFollowUp = UserPreferencesSettings["weeks_to_follow_up"];