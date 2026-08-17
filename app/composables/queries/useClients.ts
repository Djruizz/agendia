import { useQuery } from "@tanstack/vue-query";

export function useClients() {
  const supabase = useSupabaseClient();
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
