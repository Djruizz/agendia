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
  const { formatDate, formatTime } = useDateUtils();

  const followUpViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = sanitizePhone(appointment.clients?.phone);
    if (!phone) return;

    const dateLabel = formatDate(appointment.date);

    const message =
      `Hola ${appointment.clients?.name ?? ""}, ` +
      `te escribo para hacer seguimiento de tu cita del ${dateLabel}. ` +
      `¿Te gustaría agendar una nueva?`;

    const url = buildWhatsAppUrl(phone, message);
    if (import.meta.client) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const sendConfirmationViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = sanitizePhone(appointment.clients?.phone);
    if (!phone) return;

    const dateLabel = formatDate(appointment.date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeLabel = formatTime(appointment.date, {
      hour: "2-digit",
      minute: "2-digit",
    });

    const message =
      `Hola ${appointment.clients?.name ?? ""}! ` +
      `Te recordamos tu cita de ${appointment.services?.name ?? ""} ` +
      `el ${dateLabel} a las ${timeLabel}. ` +
      `Por favor confirma tu asistencia. ¡Gracias!`;

    const url = buildWhatsAppUrl(phone, message);
    if (import.meta.client) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return {
    followUpViaWhatsApp,
    sendConfirmationViaWhatsApp,
  };
};
