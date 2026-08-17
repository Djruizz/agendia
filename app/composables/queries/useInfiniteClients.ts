import { useInfiniteQuery } from "@tanstack/vue-query";
import { _ } from "vue-router/dist/index-BN0B0y8a.js";

const PAGE_SIZE = 20;

export const useInfiniteClients = () => {
  const searchTerm = ref("");

  const supabase = useSupabaseClient();
  const fetchClients = async ({
    queryKey,
    pageParam = 0,
  }: {
    queryKey: string[];
    pageParam?: number;
  }) => {
    const [_, term] = queryKey;
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (term) {
      query = query.ilike("name", `%${term}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return {
      data,
      nextPage: to + 1,
    };
  };
  const infiniteQuery = useInfiniteQuery({
    queryKey: ["clients", searchTerm.value],
    queryFn: fetchClients,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage =
        lastPage.data.length === PAGE_SIZE ? lastPage.nextPage : undefined;
      return nextPage;
    },
  });
  return {
    ...infiniteQuery,
    searchTerm,
  };
};
