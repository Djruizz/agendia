<script setup lang="ts">
const { enabled, activationUrl } = useSupportWhatsApp();
</script>

<template>
  <LandingReveal>
    <UPageCTA
      title="Prueba Agendia gratis por 1 mes"
      description="Después son $100 al mes, con pago directo (transferencia o efectivo) y sin cargos automáticos. Por ahora el acceso es por invitación: escríbenos y activamos tu cuenta."
      variant="soft"
    >
      <template #body>
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <UButton
            v-if="enabled"
            :to="activationUrl"
            target="_blank"
            rel="noopener noreferrer"
            icon="i-lucide-message-circle"
            label="Empezar por WhatsApp"
            size="xl"
          />
          <UButton
            v-else
            to="/register"
            icon="i-lucide-user-plus"
            label="Crear cuenta"
            size="xl"
          />
          <UButton
            to="/login"
            color="neutral"
            variant="outline"
            icon="i-lucide-log-in"
            label="Entrar"
            size="xl"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-3">
          <p class="text-sm text-muted">
            o escríbenos a
            <ULink
              :to="`mailto:${SITE.email}`"
              class="text-primary font-medium"
            >
              {{ SITE.email }}
            </ULink>
          </p>
        </div>
      </template>
    </UPageCTA>
  </LandingReveal>
</template>
