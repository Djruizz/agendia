export const useSupportWhatsApp = () => {
  const enabled =
    SITE.whatsapp.length > 0 && !SITE.whatsapp.startsWith("[");

  const supportUrl = enabled
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
        "Hola, necesito ayuda para usar Agendia (versión beta)",
      )}`
    : "";

  const reportUrl = enabled
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
        "Hola, quiero reportar un problema en Agendia (versión beta):",
      )}`
    : "";

  return { enabled, supportUrl, reportUrl };
};
