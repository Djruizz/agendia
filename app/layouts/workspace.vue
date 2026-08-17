<template>
  <div class="min-h-dvh">
    <LayoutHeader />

    <UMain class="min-w-0 pb-20">
      <UContainer class="py-4 min-w-0 max-w-full">
        <div class="min-w-0 max-w-full overflow-hidden">
          <slot />
        </div>
      </UContainer>
    </UMain>

    <LayoutBottomNav />
  </div>
</template>
