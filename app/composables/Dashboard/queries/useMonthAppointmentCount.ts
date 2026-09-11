import { useQuery } from "@tanstack/vue-query";

export const useMonthAppointmentCount = (
  year: Ref<number>,
  month: Ref<number>,
) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  const yearMonth = computed(
    () => `${year.value}-${String(month.value).padStart(2, "0")}`,
  );

  return useQuery({
    queryKey: computed(() => [
      "appointments",
      "month-count",
      user.value?.sub,
      yearMonth.value,
    ]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const start = new Date(year.value, month.value - 1, 1, 0, 0, 0, 0);
      const end = new Date(year.value, month.value, 1, 0, 0, 0, 0);

      const { count, error } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("professional_id", user.value!.sub)
        .gte("date", start.toISOString())
        .lt("date", end.toISOString())
        .neq("status", "CANCELED");

      if (error) throw error;
      return count ?? 0;
    },
  });
};