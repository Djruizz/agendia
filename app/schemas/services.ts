import { z } from "zod";

export const serviceSchema = z.object({
  name: z
    .string("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  price: z
    .number("El precio es requerido")
    .min(1, "El precio debe ser mayor a 0")
    .max(1000000, "El precio debe ser menor a 1000000"),
  duration_minutes: z
    .number("La duración es requerida")
    .min(1, "La duración debe ser mayor a 0")
    .max(1000000, "La duración debe ser menor a 1000000"),
  description: z.string("La descripción es inválida").optional(),
});

export type ServiceSchema = z.infer<typeof serviceSchema>;
