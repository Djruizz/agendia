import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string("Contraseña inválida"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.email("Email inválido"),
    password: z
      .string("Contraseña inválida")
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string("Confirma tu contraseña"),
    terms: z.boolean().refine((v) => v === true, {
      message: "Debes aceptar los Términos y el Aviso de privacidad",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Email inválido"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string("Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const changeEmailSchema = z.object({
  email: z.email("Email inválido"),
});

export type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string("Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string("Contraseña inválida").min(1, "Ingresa tu contraseña"),
});

export type DeleteAccountSchema = z.infer<typeof deleteAccountSchema>;
