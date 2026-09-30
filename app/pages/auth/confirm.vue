<script setup lang="ts">
definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const route = useRoute();
const supabase = useSupabaseClient();
const toast = useToast();

const status = ref<"loading" | "success" | "error">("loading");
const errorMessage = ref("");

function fail(message: string) {
  status.value = "error";
  errorMessage.value = message;
}

function succeed() {
  status.value = "success";
  toast.add({
    title: "Cuenta confirmada",
    description: "¡Bienvenido a Agendia!",
    icon: "i-lucide-circle-check",
    color: "success",
  });
  return navigateTo("/workspace", { replace: true });
}

onMounted(async () => {
  // 1. Extraer parámetros tanto de la Query (?key=val) como del Fragmento (#key=val)
  const queryParams = route.query;
  const hashParams = new URLSearchParams(window.location.hash.substring(1));

  // Detectar errores enviados por Supabase
  const error = queryParams.error || hashParams.get("error");
  const errorCode = queryParams.error_code || hashParams.get("error_code");
  const errorDesc =
    queryParams.error_description || hashParams.get("error_description");

  // CASO A: Fallo en la verificación
  if (error || errorCode) {
    fail((errorDesc as string) || "El enlace es inválido o ya fue utilizado.");
    return;
  }

  // CASO B: Flujo PKCE (viene un ?code=...)
  // const code = queryParams.code as string;
  // if (code) {
  //   const { error: exchangeError } =
  //     await supabase.auth.exchangeCodeForSession(code);
  //   if (exchangeError) {
  //     fail(exchangeError.message);
  //     return;
  //   }
  // }

  // CASO C: Verificar sesión activa (válido para PKCE o Flujo Hash)
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    // Si no hay sesión ni error explícito, la URL fue abierta sin contexto
    fail("No se encontró una sesión válida. Inicia sesión manualmente.");
    return;
  }

  succeed();
});

// onMounted(async () => {
//   try {
//     const urlError = route.query.error as string | undefined;
//     const urlErrorDescription = route.query.error_description as
//       | string
//       | undefined;
//     if (urlError) {
//       const desc = urlErrorDescription ?? urlError;
//       fail(
//         desc.toLowerCase().includes("expired") ||
//           desc.toLowerCase().includes("used")
//           ? "El enlace expiró o ya fue usado. Solicita uno nuevo."
//           : `No se pudo confirmar tu cuenta: ${desc}`,
//       );
//       return;
//     }

//     const tokenHash = route.query.token_hash as string | undefined;
//     if (tokenHash) {
//       const { error } = await supabase.auth.verifyOtp({
//         token_hash: tokenHash,
//         type: "signup",
//       });
//       if (error) {
//         fail(
//           error.message.includes("expired") || error.message.includes("used")
//             ? "El enlace expiró o ya fue usado. Solicita uno nuevo."
//             : "No se pudo confirmar tu cuenta.",
//         );
//         return;
//       }

//       await succeed();
//       return;
//     }

//     const code = route.query.code as string | undefined;
//     if (code) {
//       const { error } = await supabase.auth.exchangeCodeForSession(code);
//       if (error) {
//         fail(
//           error.message.includes("expired") || error.message.includes("used")
//             ? "El enlace expiró o ya fue usado. Solicita uno nuevo."
//             : "No se pudo confirmar tu cuenta.",
//         );
//         return;
//       }

//       await succeed();
//       return;
//     }

//     const { data, error } = await supabase.auth.getSession();
//     if (error || !data.session) {
//       fail("Enlace de confirmación inválido o ya utilizado.");
//       return;
//     }

//     await succeed();
//   } catch {
//     fail("Ocurrió un error inesperado al confirmar tu cuenta.");
//   }
// });
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
        <UButton
          to="/login"
          block
          label="Ir a iniciar sesión"
          icon="i-lucide-log-in"
        />
      </template>
    </div>
  </UCard>
</template>
