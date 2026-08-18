<template>
  <UHeader :toggle="false">
    <template #title>
      <img
        src="/agendia-text-transparent.png"
        alt="Logo"
        class="rounded-xl h-10"
      />
    </template>
    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>

  <UMain>
    <UContainer class="py-4">
      <slot />
    </UContainer>
  </UMain>
</template>
