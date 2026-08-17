import type { AppointmentWithRelations } from "~/types/appointments";

const sanitizePhone = (raw: string | null | undefined) => {
  if (!raw) return null;
  return raw.replace(/[^\d+]/g, "");
};

const buildWhatsAppUrl = (phone: string, message: string) => {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${phone}?${params.toString()}`;
};

export const useAppointmentActions = () => {
  const followUpViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = sanitizePhone(appointment.clients?.phone);
    if (!phone) return;

    const dateLabel = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(appointment.date));

    const message =
      `Hola ${appointment.clients?.name ?? ""}, ` +
      `te escribo para hacer seguimiento de tu cita del ${dateLabel}. ` +
      `¿Te gustaría agendar una nueva?`;

    const url = buildWhatsAppUrl(phone, message);
    if (import.meta.client) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return {
    followUpViaWhatsApp,
  };
};
