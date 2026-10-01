import { useQuery } from "@tanstack/vue-query";

export type ClientStats = {
  total: number;
  completed: number;
  revenue: number;
  lastVisit: string | null;
  nextAppointment: string | null;
};

export function useClientStats(clientId: MaybeRefOrGetter<string>) {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const id = toRef(clientId);

  return useQuery({
    queryKey: computed(() => [
      "appointments",
      "client-stats",
      user.value?.sub,
      id.value,
    ]),
    enabled: computed(() => !!user.value?.sub && !!id.value),
    queryFn: async (): Promise<ClientStats> => {
      const { data, error } = await supabase
        .from("appointments")
        .select("date, status, price")
        .eq("professional_id", user.value!.sub)
        .eq("client_id", id.value);
      if (error) throw error;
      const rows = data ?? [];
      const completed = rows.filter((r) => r.status === "COMPLETED");
      const revenue = completed.reduce(
        (sum, r) => sum + (r.price ?? 0),
        0,
      );
      const lastVisit = completed.reduce<string | null>(
        (latest, r) =>
          !latest || new Date(r.date) > new Date(latest) ? r.date : latest,
        null,
      );
      const now = Date.now();
      const nextAppointment = rows
        .filter(
          (r) =>
            (r.status === "PENDING" || r.status === "CONFIRMED") &&
            new Date(r.date).getTime() >= now,
        )
        .reduce<string | null>(
          (earliest, r) =>
            !earliest || new Date(r.date) < new Date(earliest)
              ? r.date
              : earliest,
          null,
        );
      return {
        total: rows.length,
        completed: completed.length,
        revenue,
        lastVisit,
        nextAppointment,
      };
    },
  });
}
