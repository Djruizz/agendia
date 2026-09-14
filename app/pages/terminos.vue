<script setup lang="ts">
definePageMeta({
  layout: "landing",
});
</script>

<template>
  <LegalPage
    title="Términos y condiciones de uso"
    description="Condiciones que rigen el uso de Agendia durante la etapa beta."
    :updated-at="SITE.legalUpdatedAt"
  >
    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">1. El servicio</h2>
      <p>
        Agendia es una plataforma de gestión de agenda para profesionales
        (citas, clientes y servicios). El servicio se ofrece en versión
        <strong class="text-default">beta</strong>: software en desarrollo
        activo.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">2. Qué implica la beta</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>
          No garantizamos disponibilidad continua del servicio; puede haber
          interrupciones por mantenimiento o actualizaciones.
        </li>
        <li>
          La app puede contener errores y las funcionalidades pueden cambiar,
          agregarse o eliminarse.
        </li>
        <li>
          Hacemos esfuerzos razonables por respaldar la información, pero no
          garantizamos la recuperación total de datos. Te recomendamos mantener
          tu propia copia de la información importante.
        </li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">3. Tu cuenta</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>Debes ser mayor de edad para crear una cuenta.</li>
        <li>
          Eres responsable de la veracidad de tus datos y de mantener tu
          contraseña en secreto.
        </li>
        <li>
          Toda actividad realizada desde tu cuenta se presume realizada por ti.
        </li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">4. Uso permitido</h2>
      <p>Está prohibido:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li>Usar la app para actividades ilícitas.</li>
        <li>Intentar acceder a cuentas o datos ajenos.</li>
        <li>
          Extraer información de la plataforma de forma masiva o automatizada.
        </li>
        <li>
          Registrar datos de terceros sin su consentimiento (ver sección 5).
        </li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        5. Datos de tus clientes
      </h2>
      <p>
        Al registrar datos personales de tus clientes (nombre, teléfono, notas)
        declaras que cuentas con su consentimiento para hacerlo. Eres el único
        responsable del tratamiento que hagas de los datos de tus clientes y de
        cumplir con las obligaciones que te apliquen frente a ellos.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">6. Pagos</h2>
      <p>
        Durante la beta, el cobro del servicio se realiza de forma
        <strong class="text-default">directa y externa a la app</strong>
        (transferencia, efectivo u otro medio acordado). El precio, el periodo y
        la forma de pago se pactan por escrito contigo. Agendia no procesa pagos
        en línea ni almacena datos de tarjetas.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">7. Terminación</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>
          Puedes dejar de usar el servicio y solicitar la eliminación de tu
          cuenta cuando quieras.
        </li>
        <li>
          Si el pago del servicio termina, tendrás 30 días naturales de acceso
          para exportar tus datos; después la cuenta y su información se
          eliminarán.
        </li>
        <li>
          Podemos suspender cuentas que incumplan estos términos, previo aviso
          salvo casos graves.
        </li>
      </ul>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        8. Limitación de responsabilidad
      </h2>
      <p>
        El servicio se proporciona "tal cual" y "según disponibilidad", sin
        garantías de ningún tipo. En la medida permitida por la ley, Agendia no
        será responsable por daños indirectos, lucro cesante o pérdida de datos.
        La responsabilidad máxima total de Agendia frente a ti se limita al
        monto que hayas pagado por el periodo en curso del servicio.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        9. Cambios a estos términos
      </h2>
      <p>
        Podemos actualizar estos términos. Te avisaremos con al menos 7 días de
        anticipación por email o WhatsApp. Si continúas usando la app después de
        ese plazo, se entiende que aceptas los cambios.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        10. Ley aplicable y contacto
      </h2>
      <p>
        Estos términos se rigen por las leyes aplicables en los Estados Unidos
        Mexicanos. Para cualquier duda o reporte, escríbenos a
        <span class="font-semibold text-primary">{{ SITE.email }}</span> o por
        WhatsApp a
        <span class="font-semibold text-primary">{{ SITE.whatsapp }}</span
        >.
      </p>
    </section>
  </LegalPage>
</template>
