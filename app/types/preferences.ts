import type {
  ColorTheme,
  TimeFormat,
  WhatsAppVariable,
} from "~/schemas/preferences";

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  red: "Rojo",
  orange: "Naranja",
  amber: "Ámbar",
  yellow: "Amarillo",
  lime: "Lima",
  green: "Verde",
  emerald: "Esmeralda",
  teal: "Turquesa",
  cyan: "Cian",
  sky: "Cielo",
  blue: "Azul",
  indigo: "Índigo",
  violet: "Violeta",
  purple: "Púrpura",
  fuchsia: "Fucsia",
  pink: "Rosa",
  rose: "Rosado",
};

export const TIME_FORMAT_LABELS: Record<TimeFormat, string> = {
  "12h": "12h",
  "24h": "24h",
};

export const WHATSAPP_VARIABLE_LABELS: Record<WhatsAppVariable, string> = {
  cliente: "Nombre del cliente",
  servicio: "Nombre del servicio",
  fecha: "Fecha de la cita",
  hora: "Hora de la cita",
};