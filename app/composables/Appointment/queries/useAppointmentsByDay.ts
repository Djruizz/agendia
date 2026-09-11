import { useQuery } from "@tanstack/vue-query";

const startOfLocalDay = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00`);

const endOfLocalDay = (yyyyMmDd: string) =>
  new Date(`${yyyyMmDd}T23:59:59.999`);

export const useAppointmentsByDay = (selectedDate: Ref<string | null>) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useQuery({
    queryKey: computed(() => [
      "appointments",
      "day",
      user.value?.sub,
      selectedDate.value,
    ]),
    enabled: computed(() => !!selectedDate.value && !!user.value?.sub),
    queryFn: async () => {
      const day = selectedDate.value!;

      const { data, error } = await supabase
        .from("appointments")
        .select("*, clients:clients(*), services:services(*)")
        .eq("professional_id", user.value!.sub)
        .gte("date", startOfLocalDay(day).toISOString())
        .lte("date", endOfLocalDay(day).toISOString())
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
