import { useQuery } from "@tanstack/vue-query";

const startOfLocalDay = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

const endOfLocalDay = (yyyyMmDd: string) =>
  new Date(`${yyyyMmDd}T23:59:59.999`);

export const useAppointmentsByDay = (selectedDate: Ref<string | null>) => {
  const supabase = useSupabaseClient();

  return useQuery({
    queryKey: computed(() => ["appointments", "day", selectedDate.value]),
    enabled: computed(() => !!selectedDate.value),
    queryFn: async () => {
      const day = selectedDate.value!;

      const { data, error } = await supabase
        .from("appointments")
        .select("*, client:clients(*), service:services(*)")
        .gte("date", startOfLocalDay(day).toISOString())
        .lte("date", endOfLocalDay(day).toISOString())
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
