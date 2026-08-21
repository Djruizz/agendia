import { useInfiniteQuery } from "@tanstack/vue-query";
import type { AppointmentWithRelations } from "~/types/appointments";

const PAGE_SIZE = 5;
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const buildPseudoQuery = (
  query: any,
  filter: "REAGENDADA" | "REMEMBER",
  weeksToFollowUp: number,
) => {
  query = query.eq("status", "COMPLETED");
  if (filter === "REAGENDADA") {
    return query.eq("followed_up", true);
  }
  const cutoffIso = new Date(
    Date.now() - weeksToFollowUp * MS_PER_WEEK,
  ).toISOString();
  return query.eq("followed_up", false).lte("date", cutoffIso);
};

export const useInfiniteAppointments = () => {
  const supabase = useSupabaseClient();
  const statusFilter = ref<AppointmentStatusFilter>("ALL");
  const { weeksToFollowUp } = useWeeksToFollowUp();

  const fetchAppointments = async ({
    pageParam = 0,
  }: {
    pageParam?: number;
  }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("appointments")
      .select("*, clients:clients(*), services:services(*)")
      .order("date", { ascending: false })
      .range(from, to);

    if (
      statusFilter.value === "REAGENDADA" ||
      statusFilter.value === "REMEMBER"
    ) {
      query = buildPseudoQuery(query, statusFilter.value, weeksToFollowUp.value);
    } else if (statusFilter.value !== "ALL") {
      query = query.eq("status", statusFilter.value);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data ?? []) as AppointmentWithRelations[] };
  };

  const queryKey = computed(() => [
    "appointments",
    "list",
    statusFilter.value,
    weeksToFollowUp.value,
  ]);

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: fetchAppointments,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.data.length === PAGE_SIZE ? lastPageParam + 1 : undefined;
    },
  });

  return {
    ...infiniteQuery,
    statusFilter,
  };
};