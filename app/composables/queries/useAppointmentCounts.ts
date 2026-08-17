import { useQuery } from "@tanstack/vue-query";

const localDayKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const useAppointmentCounts = (year: Ref<number>, month: Ref<number>) => {
  const supabase = useSupabaseClient();

  const yearMonth = computed(
    () => `${year.value}-${String(month.value).padStart(2, "0")}`,
  );

  return useQuery({
    queryKey: computed(() => ["appointments", "counts", yearMonth.value]),
    queryFn: async () => {
      const start = new Date(year.value, month.value - 1, 1, 0, 0, 0, 0);
      const end = new Date(year.value, month.value, 1, 0, 0, 0, 0);

      const { data, error } = await supabase
        .from("appointments")
        .select("date")
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
