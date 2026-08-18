<template>
  <UHeader :toggle="false">
    <template #title>
      <NuxtLink to="/">
        <img
          src="/agendia-text-transparent.png"
          alt="Agendia"
          class="rounded-xl h-10"
        />
      </NuxtLink>
    </template>
    <template #right>
      <UButton
        to="/login"
        icon="i-lucide-log-in"
        label="Entrar"
      />
      <UColorModeButton />
    </template>
  </UHeader>

  <UMain>
    <slot />
  </UMain>
</template>
