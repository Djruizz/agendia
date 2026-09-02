import { useQuery } from "@tanstack/vue-query";
import type { Ref } from "vue";
import { BUSINESS_SLUG_REGEX } from "~/schemas/business";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function useSlugAvailability(source: Ref<string> | string) {
  const supabase = useSupabaseClient();
  const src = isRef(source) ? source : ref(source);
  const debounced = ref(src.value);

  let timer: ReturnType<typeof setTimeout> | null = null;
  watch(
    src,
    (v) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        debounced.value = v;
      }, 500);
    },
    { immediate: true },
  );

  onScopeDispose(() => {
    if (timer) clearTimeout(timer);
  });

  return useQuery({
    queryKey: computed(() => ["slug-availability", debounced.value]),
    enabled: computed(
      () =>
        !!debounced.value &&
        BUSINESS_SLUG_REGEX.test(debounced.value) &&
        debounced.value.length >= 3,
    ),
    queryFn: async (): Promise<{ available: boolean }> => {
      const { data, error } = await supabase.rpc("is_slug_available", {
        p_slug: debounced.value,
      });
      if (error) throw error;
      return { available: !!data };
    },
  });
}