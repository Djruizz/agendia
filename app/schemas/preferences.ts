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
  })
  .strict();

export type UserPreferencesSettings = z.infer<typeof UserPreferencesSchema>;
export type ColorTheme = UserPreferencesSettings["color_theme"];
export type TimeFormat = UserPreferencesSettings["time_format"];
export type WeeksToFollowUp = UserPreferencesSettings["weeks_to_follow_up"];