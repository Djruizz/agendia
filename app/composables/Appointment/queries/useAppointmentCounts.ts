import { useQuery } from "@tanstack/vue-query";

export const useAppointmentCounts = (year: Ref<number>, month: Ref<number>) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const { localDayKey } = DateUtils();

  const yearMonth = computed(
    () => `${year.value}-${String(month.value).padStart(2, "0")}`,
  );

  return useQuery({
    queryKey: computed(() => [
      "appointments",
      "counts",
      user.value?.sub,
      yearMonth.value,
    ]),
    enabled: computed(() => !!user.value?.sub),
    queryFn: async () => {
      const start = new Date(year.value, month.value - 1, 1, 0, 0, 0, 0);
      const end = new Date(year.value, month.value, 1, 0, 0, 0, 0);

      const { data, error } = await supabase
        .from("appointments")
        .select("date")
        .eq("professional_id", user.value!.sub)
        .gte("date", start.toISOString())
        .lt("date", end.toISOString());

      if (error) throw error;

      const counts = new Map<string, number>();
      for (const row of data) {
        const day = localDayKey(new Date(row.date));
        counts.set(day, (counts.get(day) ?? 0) + 1);
      }
      return counts;
    },
  });
};
