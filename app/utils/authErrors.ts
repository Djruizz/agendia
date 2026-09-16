export type AuthErrorCode =
  | "network"
  | "invalid-credentials"
  | "email-not-confirmed"
  | "email-taken"
  | "rate-limit"
  | "signup-not-allowed"
  | "unknown";

export interface AuthErrorFeedback {
  code: AuthErrorCode;
  title: string;
  description: string;
  icon: string;
  color: "error" | "warning";
}

const NETWORK_ERROR_PATTERN =
  /fetch failed|failed to fetch|networkerror|load failed|network error|timed out|timeout/i;

export function describeAuthError(error: unknown): AuthErrorFeedback {
  const message =
    error instanceof Error ? error.message : String(error ?? "");

  if (NETWORK_ERROR_PATTERN.test(message)) {
    return {
      code: "network",
      title: "Sin conexión",
      description: "Revisa tu conexión a internet e inténtalo de nuevo.",
      icon: "i-lucide-wifi-off",
      color: "error",
    };
  }
  if (/not confirmed/i.test(message)) {
    return {
      code: "email-not-confirmed",
      title: "Email no confirmado",
      description: "Confirma tu correo antes de iniciar sesión",
      icon: "i-lucide-mail-warning",
      color: "warning",
    };
  }
  if (/invalid login credentials/i.test(message)) {
    return {
      code: "invalid-credentials",
      title: "Credenciales inválidas",
      description: "El correo o la contraseña no son correctos",
      icon: "i-lucide-circle-x",
      color: "error",
    };
  }
  if (/already (been )?registered/i.test(message)) {
    return {
      code: "email-taken",
      title: "Correo ya registrado",
      description:
        "Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.",
      icon: "i-lucide-circle-x",
      color: "error",
    };
  }
  if (/rate limit|too many|only request|once every/i.test(message)) {
    return {
      code: "rate-limit",
      title: "Demasiados intentos",
      description: "Espera unos momentos antes de intentar de nuevo.",
      icon: "i-lucide-hourglass",
      color: "warning",
    };
  }
  // GoTrue suele tragar el mensaje custom del trigger de allowlist y devolver
  // el genérico "Database error saving new user" — se mapean ambos patrones.
  if (
    /agendia_signup_not_allowed|database error saving new user/i.test(message)
  ) {
    return {
      code: "signup-not-allowed",
      title: "Registro restringido",
      description:
        "Agendia está en acceso por invitación. Necesitas permiso para crear una cuenta.",
      icon: "i-lucide-user-x",
      color: "error",
    };
  }
  return {
    code: "unknown",
    title: "Error",
    description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
    icon: "i-lucide-circle-x",
    color: "error",
  };
}
