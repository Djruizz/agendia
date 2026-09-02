import { z } from "zod";

export const BUSINESS_TIMEZONES = [
  "America/Mexico_City",
  "America/Cancun",
  "America/Merida",
  "America/Monterrey",
  "America/Tijuana",
  "America/Hermosillo",
  "America/Chihuahua",
] as const;

export const BUSINESS_SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const businessSchema = z.object({
  business_name: z
    .string("El nombre del negocio es requerido")
    .min(3, "El nombre del negocio debe tener al menos 3 caracteres")
    .max(60, "El nombre del negocio debe tener menos de 60 caracteres"),
  owner_name: z
    .string("El nombre del profesional es inválido")
    .max(60, "El nombre del profesional debe tener menos de 60 caracteres")
    .optional(),
  slug: z
    .string("El enlace público es requerido")
    .min(3, "El enlace público debe tener al menos 3 caracteres")
    .max(60, "El enlace público debe tener menos de 60 caracteres")
    .regex(BUSINESS_SLUG_REGEX, "El enlace público solo admite minúsculas, números y guiones"),
  description: z
    .string("La descripción es inválida")
    .max(300, "La descripción debe tener menos de 300 caracteres")
    .optional(),
  phone: z
    .string("El teléfono es inválido")
    .max(20, "El teléfono debe tener menos de 20 caracteres")
    .optional(),
  timezone: z.enum(BUSINESS_TIMEZONES).default("America/Mexico_City"),
});

export type BusinessSchema = z.infer<typeof businessSchema>;
