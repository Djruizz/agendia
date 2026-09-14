<script setup lang="ts">
definePageMeta({
  layout: "landing",
});
</script>

<template>
  <LegalPage
    title="Aviso de privacidad"
    description="Cómo Agendia recaba, usa y protege los datos personales."
    :updated-at="SITE.legalUpdatedAt"
  >
    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        1. Responsable del tratamiento
      </h2>
      <p>
        El responsable del tratamiento de tus datos personales es
        <span class="font-semibold text-primary">{{ SITE.ownerName }}</span>
        (en adelante, "Agendia"), con contacto en
        <span class="font-semibold text-primary">{{ SITE.email }}</span> y
        WhatsApp
        <span class="font-semibold text-primary">{{ SITE.whatsapp }}</span
        >.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        2. Datos personales que recabamos
      </h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>
          <strong class="text-default">Cuenta:</strong> correo electrónico y
          contraseña (almacenada únicamente como hash, nunca en texto plano), y
          la fecha de aceptación de los términos de uso.
        </li>
        <li>
          <strong class="text-default">Perfil de negocio:</strong> nombre del
          negocio, categoría, dirección web pública (slug), logotipo y color de
          marca que subes voluntariamente.
        </li>
        <li>
          <strong class="text-default">Preferencias de uso:</strong> color de la
          app, formato de hora y semanas de recordatorio.
        </li>
        <li>
          <strong class="text-default">Datos de tus clientes:</strong>
          nombre, teléfono y notas que tú, como profesional, registras
          manualmente para agendar citas. Estos datos pertenecen a terceros y tú
          eres responsable de contar con su consentimiento para registrarlos
          (ver sección 5).
        </li>
      </ul>
      <p>
        No recabamos datos financieros de tus clientes ni procesamos pagos
        dentro de la app.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">3. Finalidades</h2>
      <ul class="list-disc pl-5 space-y-1">
        <li>Prestar el servicio de gestión de citas, clientes y servicios.</li>
        <li>
          Darte soporte técnico y comunicación operativa (email/WhatsApp).
        </li>
        <li>
          Corregir errores y mejorar el producto durante la etapa beta, a partir
          de reportes de problemas.
        </li>
      </ul>
      <p>
        No usamos tus datos personales para publicidad, no los vendemos ni los
        compartimos con fines comerciales.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        4. Transferencias a proveedores
      </h2>
      <p>
        La plataforma opera sobre infraestructura de terceros (base de datos y
        almacenamiento en la nube de
        <span class="font-semibold text-primary">{{ SITE.infraProvider }}</span
        >), con servidores fuera de México. Esta transferencia es necesaria para
        prestar el servicio y los datos se protegen con cifrado en tránsito
        (HTTPS) y aislamiento por cuenta.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        5. Sobre los datos de tus clientes
      </h2>
      <p>
        Al registrar datos de tus clientes declaras que cuentas con su
        consentimiento para tratar sus datos personales en Agendia. Tú eres
        responsable frente a ellos del tratamiento que hagas con su información;
        Agendia solo la procesa por instrucciones tuyas para preestarte el
        servicio de agenda.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        6. Conservación de datos
      </h2>
      <p>
        Conservamos tus datos mientras tu cuenta exista. Si cancelas tu cuenta o
        das por terminado el servicio, tendrás 30 días naturales para exportar
        tu información; después la eliminaremos de forma permanente.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">7. Tus derechos (ARCO)</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, cancelación y
        oposición enviando una solicitud a
        <span class="font-semibold text-primary"
          ><a :href="`mailto:${SITE.email}`" target="_blank">{{
            SITE.email
          }}</a></span
        >. Responderemos en un máximo de 20 días hábiles y verificaremos tu
        identidad antes de procesar la solicitud.
      </p>
    </section>

    <section class="space-y-2">
      <h2 class="text-lg font-semibold text-default">
        8. Cambios a este aviso
      </h2>
      <p>
        Este aviso puede actualizarse. Publicaremos cualquier cambio en esta
        misma página con nueva fecha de actualización. El uso continuado de la
        app después de los cambios implica su aceptación.
      </p>
    </section>
  </LegalPage>
</template>
