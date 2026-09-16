<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    delay?: number;
  }>(),
  { delay: 0 },
);

const el = ref<HTMLElement | null>(null);
const visible = ref(false);

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visible.value = true;
    return;
  }
  if (!el.value) return;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true;
        io.disconnect();
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  io.observe(el.value);
});
</script>

<template>
  <div
    ref="el"
    :style="{ transitionDelay: `${props.delay}ms` }"
    class="transition-all duration-700 ease-out motion-reduce:transition-none"
    :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
  >
    <slot />
  </div>
</template>
