<script setup lang="ts">
type EmailOtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const supabase = useSupabaseClient();
const toast = useToast();

const status = ref<"loading" | "success" | "error">("loading");
const errorMessage = ref("");

function cleanConfirmError(desc?: string | null): string {
  if (!desc) return "El enlace es inválido o ya expiró.";
  const lower = desc.toLowerCase();
  if (lower.includes("expired") || lower.includes("expiró")) {
    return "El enlace de confirmación expiró. Inicia sesión para solicitar uno nuevo.";
  }
  if (
    lower.includes("used") ||
    lower.includes("already") ||
    lower.includes("usado")
  ) {
    return "El enlace ya fue utilizado o es inválido. Intenta iniciar sesión.";
  }
  if (
    lower.includes("code_verifier") ||
    lower.includes("both auth code and code verifier")
  ) {
    return "El enlace PKCE no se abrió en el mismo navegador. Solicita un nuevo correo de confirmación.";
  }
  return desc;
}

function fail(message: string) {
  status.value = "error";
  errorMessage.value = message;
}

async function succeed() {
  status.value = "success";
  toast.add({
    title: "Cuenta confirmada",
    description: "¡Bienvenido a Agendia!",
    icon: "i-lucide-circle-check",
    color: "success",
  });
  await navigateTo("/workspace", { replace: true });
}

onMounted(async () => {
  try {
    const queryParams = route.query;
    const rawHash = window.location.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(rawHash);

    // 1. Detectar errores explícitos devueltos por Supabase
    const error = (queryParams.error as string) || hashParams.get("error");
    const errorDesc =
      (queryParams.error_description as string) ||
      hashParams.get("error_description");

    if (error || errorDesc) {
      fail(cleanConfirmError(errorDesc || error));
      return;
    }

    // 2. Flujo recomendado: token_hash (Cross-device seguro)
    const tokenHash =
      (queryParams.token_hash as string) || hashParams.get("token_hash");
    if (tokenHash) {
      const type = ((queryParams.type as string) ||
        hashParams.get("type") ||
        "signup") as EmailOtpType;
      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (otpError) {
        fail(cleanConfirmError(otpError.message));
        return;
      }

      await succeed();
      return;
    }

    // 3. Fallback Flujo PKCE (?code=...)
    const code = (queryParams.code as string) || hashParams.get("code");
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        fail(cleanConfirmError(exchangeError.message));
        return;
      }

      await succeed();
      return;
    }

    // 4. Fallback Implicit Flow (#access_token=...&refresh_token=...)
    const accessToken = hashParams.get("access_token");
    if (accessToken) {
      const refreshToken = hashParams.get("refresh_token") || "";
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        fail(cleanConfirmError(sessionError.message));
        return;
      }

      await succeed();
      return;
    }

    // 5. Fallback a sesión activa previa
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (session && !sessionError) {
      await succeed();
      return;
    }

    // 6. Sin parámetros de autenticación válidos
    fail(
      "No se encontraron datos de confirmación en el enlace. Inicia sesión o solicita un nuevo correo.",
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err ?? "");
    fail(cleanConfirmError(msg));
  }
});
</script>

<template>
  <UCard class="max-w-lg mx-auto">
    <div class="text-center py-6 space-y-4">
      <template v-if="status === 'loading'">
        <UIcon
          name="i-lucide-loader-circle"
          class="size-8 animate-spin text-primary mx-auto"
        />
        <p class="text-sm text-muted">Confirmando tu cuenta...</p>
      </template>

      <template v-else-if="status === 'success'">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-circle-check" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-default">Cuenta confirmada</h2>
          <p class="text-sm text-muted">Redirigiéndote a tu workspace...</p>
        </div>
      </template>

      <template v-else-if="status === 'error'">
        <div
          class="inline-flex items-center justify-center size-14 rounded-full bg-error/10 text-error"
        >
          <UIcon name="i-lucide-circle-x" class="size-7" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-semibold text-default">
            No se pudo confirmar
          </h2>
          <p class="text-sm text-muted">{{ errorMessage }}</p>
        </div>
        <div class="pt-2 space-y-2">
          <UButton
            to="/login"
            block
            label="Ir a iniciar sesión"
            icon="i-lucide-log-in"
          />
        </div>
      </template>
    </div>
  </UCard>
</template>
