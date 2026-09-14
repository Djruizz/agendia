import type { AppointmentWithRelations } from "~/types/appointments";
import {
  renderWhatsAppTemplate,
  useWhatsAppMessages,
  type WhatsAppTemplateVars,
} from "~/composables/User/utils/useWhatsAppMessages";

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
  const { whatsappMessages } = useWhatsAppMessages();

  const buildTemplateVars = (
    appointment: AppointmentWithRelations,
  ): WhatsAppTemplateVars => ({
    cliente: appointment.clients?.name ?? "",
    servicio: appointment.services?.name ?? "",
    fecha: formatDate(appointment.date, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    hora: formatTime(appointment.date, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  const followUpViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = sanitizePhone(appointment.clients?.phone);
    if (!phone) return;

    const message = renderWhatsAppTemplate(
      whatsappMessages.value.follow_up,
      buildTemplateVars(appointment),
    );

    const url = buildWhatsAppUrl(phone, message);
    if (import.meta.client) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const sendConfirmationViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = sanitizePhone(appointment.clients?.phone);
    if (!phone) return;

    const message = renderWhatsAppTemplate(
      whatsappMessages.value.confirmation,
      buildTemplateVars(appointment),
    );

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
