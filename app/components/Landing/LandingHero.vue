<script setup lang="ts">
const { enabled, activationUrl } = useSupportWhatsApp();
</script>

<template>
  <UPageHero
    title="Organiza tu agenda sin esfuerzo"
    description="Agendia reúne tus citas, clientes, servicios y ganancias en un solo lugar. Y además te da una página pública para que tus clientes te encuentren."
    orientation="horizontal"
  >
    <template #headline>
      <UBadge color="primary" variant="subtle" label="App para profesionales" />
    </template>

    <template #footer>
      <div class="flex flex-wrap gap-x-6 gap-y-3">
        <UButton
          v-if="enabled"
          :to="activationUrl"
          target="_blank"
          rel="noopener noreferrer"
          icon="i-lucide-message-circle"
          label="Quiero Agendia en mi negocio"
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
      <p class="text-sm text-muted mt-4">
        ¿Ya te invitaron?
        <ULink to="/register" class="text-primary font-medium">
          Crea tu cuenta
        </ULink>
      </p>
    </template>

    <LandingReveal :delay="200">
      <LandingAppMock />
    </LandingReveal>
  </UPageHero>
</template>
