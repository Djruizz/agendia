import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string("Contraseña inválida"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
