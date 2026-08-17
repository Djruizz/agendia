import { useInfiniteQuery } from "@tanstack/vue-query";
import type { AppointmentWithRelations } from "~/types/appointments";

export type { AppointmentStatusFilter };

const PAGE_SIZE = 5;
const WEEKS_FOR_REMEMBER = 3;
const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

const buildPseudoQuery = (query: any, filter: "REAGENDADA" | "REMEMBER") => {
  query = query.eq("status", "COMPLETED");
  if (filter === "REAGENDADA") {
    return query.eq("followed_up", true);
  }
  const threeWeeksAgoIso = new Date(
    Date.now() - WEEKS_FOR_REMEMBER * MS_PER_WEEK,
  ).toISOString();
  return query.eq("followed_up", false).lte("date", threeWeeksAgoIso);
};

export const useInfiniteAppointments = () => {
  const supabase = useSupabaseClient();
  const statusFilter = ref<AppointmentStatusFilter>("ALL");

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
      query = buildPseudoQuery(query, statusFilter.value);
    } else if (statusFilter.value !== "ALL") {
      query = query.eq("status", statusFilter.value);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: (data ?? []) as AppointmentWithRelations[] };
  };

  const queryKey = computed(() => ["appointments", "list", statusFilter.value]);

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
