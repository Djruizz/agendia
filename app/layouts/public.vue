<template>
  <div class="min-h-screen flex flex-col bg-default">
    <UHeader :toggle="false" title="Agendia" to="/">
      <template #title>
        <img
          src="/agendia-logo-text.png"
          alt="Agendia"
          class="rounded-xl h-9"
        />
      </template>
      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <UContainer class="py-6">
        <slot />
      </UContainer>
    </UMain>

    <footer class="py-6">
      <UContainer>
        <p class="text-center text-xs text-muted">
          Hecho con
          <NuxtLink to="/" class="text-primary font-medium"> Agendia </NuxtLink>
        </p>
      </UContainer>
    </footer>
  </div>
</template>
