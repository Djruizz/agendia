import { useQuery } from "@tanstack/vue-query";

export function useServices() {
  const supabase = useSupabaseClient();
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });
}
