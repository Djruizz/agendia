import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string("El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  phone: z
    .string("El teléfono es requerido")
    .min(10, "El teléfono debe tener al menos 10 caracteres")
    .max(15, "El teléfono debe tener máximo 15 caracteres")
    .regex(/^[0-9+\s-]+$/, "Solo se permiten números, +, espacios y guiones"),
  notes: z.string().optional(),
});

export type ClientSchema = z.infer<typeof clientSchema>;
