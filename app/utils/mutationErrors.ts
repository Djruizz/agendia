export class FriendlyError extends Error {}

const NETWORK_ERROR_PATTERN =
  /fetch failed|failed to fetch|networkerror|load failed|network error|network request|timed out|timeout/i;
const RATE_LIMIT_PATTERN = /rate limit|too many|only request|once every/i;
const DUPLICATE_KEY_PATTERN = /duplicate key|unique constraint|already exists/i;

export function describeMutationError(error: unknown): string {
  if (error instanceof FriendlyError) return error.message;

  const message =
    error instanceof Error ? error.message : String(error ?? "");
  const code = (error as { code?: string } | null)?.code ?? "";

  if (NETWORK_ERROR_PATTERN.test(message)) {
    return "Sin conexión. Revisa tu internet e inténtalo de nuevo.";
  }
  if (code === "23505" || DUPLICATE_KEY_PATTERN.test(message)) {
    return "Ya existe un registro con esos datos. Revisa e inténtalo de nuevo.";
  }
  if (RATE_LIMIT_PATTERN.test(message)) {
    return "Demasiados intentos. Espera unos momentos antes de probar de nuevo.";
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
