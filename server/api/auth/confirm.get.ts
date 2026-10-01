import { serverSupabaseClient } from "#supabase/server";

type EmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const token_hash = query.token_hash as string | undefined;
  const type = query.type as EmailOtpType | undefined;
  const code = query.code as string | undefined;
  const next = (query.next as string) || "/workspace";

  const supabase = await serverSupabaseClient(event);

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      return sendRedirect(
        event,
        `/auth/confirm?error=${encodeURIComponent(error.message)}`,
      );
    }

    if (type === "recovery") {
      return sendRedirect(event, "/reset-password");
    }

    return sendRedirect(event, next);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return sendRedirect(
        event,
        `/auth/confirm?error=${encodeURIComponent(error.message)}`,
      );
    }

    return sendRedirect(event, next);
  }

  return sendRedirect(
    event,
    "/auth/confirm?error=enlace_invalido&error_description=Faltan+parámetros+de+autenticación",
  );
});