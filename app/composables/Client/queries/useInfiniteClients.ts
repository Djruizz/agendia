import { useInfiniteQuery } from "@tanstack/vue-query";

const PAGE_SIZE = 10;

export const useInfiniteClients = () => {
  const searchTerm = ref("");
  const sortOrder = ref<"asc" | "desc">("asc");

  const supabase = useSupabaseClient();

  const fetchClients = async ({ pageParam = 0 }: { pageParam?: number }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("clients")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: sortOrder.value === "asc" })
      .range(from, to);

    if (searchTerm.value) {
      query = query.ilike("name", `%${searchTerm.value}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return {
      data,
    };
  };

  const queryKey = computed(() => [
    "clients",
    searchTerm.value,
    sortOrder.value,
  ]);

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: fetchClients,
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.data.length === PAGE_SIZE ? lastPageParam + 1 : undefined;
    },
  });

  return {
    ...infiniteQuery,
    searchTerm,
    sortOrder,
  };
};
