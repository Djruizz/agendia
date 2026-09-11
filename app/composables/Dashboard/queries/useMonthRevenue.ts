import { useQuery } from "@tanstack/vue-query";

export const useMonthRevenue = (year: Ref<number>, month: Ref<number>) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const yearMonth = computed(
    () => `${year.value}-${String(month.value).padStart(2, "0")}`,
  );

  return useQuery({
    queryKey: computed(() => [
      "appointments",
      "month-revenue",
      user.value?.sub,
      yearMonth.value,
    ]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const start = new Date(year.value, month.value - 1, 1, 0, 0, 0, 0);
      const end = new Date(year.value, month.value, 1, 0, 0, 0, 0);

      const { data, error } = await supabase
        .from("appointments")
        .select("price")
        .eq("professional_id", user.value!.sub)
        .eq("status", "COMPLETED")
        .gte("date", start.toISOString())
        .lt("date", end.toISOString());

      if (error) throw error;
      return (data ?? []).reduce((sum, row) => sum + (row.price ?? 0), 0);
    },
  });
};