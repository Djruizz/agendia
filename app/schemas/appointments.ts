import { z } from "zod";

export const appointmentSchema = z.object({
  client_id: z.string().min(1, "El cliente es requerido"),
  service_id: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  duration_minutes: z
    .number("La duración es requerida")
    .min(1, "La duración debe ser mayor a 0")
    .max(1000000, "La duración debe ser menor a 1000000"),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"], {
    errorMap: () => ({ message: "Estado inválido" }),
  }),
  price: z.number().optional(),
  notes: z.string().optional(),
});

export type AppointmentSchema = z.infer<typeof appointmentSchema>;
