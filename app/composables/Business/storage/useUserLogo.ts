import { useMutation } from "@tanstack/vue-query";

const ALLOWED_EXTS = ["png", "jpg", "jpeg", "webp", "svg"] as const;
const MAX_BYTES = 2_000_000;

const getExt = (name: string): string | undefined => name.split(".").pop()?.toLowerCase();

export const useUploadLogo = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const ext = getExt(file.name);
      if (!ext || !ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])) {
        throw new Error("Formato no soportado (png, jpg, jpeg, webp, svg)");
      }
      if (file.size > MAX_BYTES) {
        throw new Error("La imagen supera el máximo de 2MB");
      }

      const path = `logos/${user.value!.sub}/logo-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("user-assets")
        .upload(path, file, { upsert: false, contentType: file.type });

      if (error) throw error;
      return path;
    },
  });
};

export const useRemoveLogo = () => {
  const supabase = useSupabaseClient();

  return useMutation({
    mutationFn: async (path: string) => {
      const { error } = await supabase.storage.from("user-assets").remove([path]);
      if (error) throw error;
    },
  });
};

export const useLogoPublicUrl = (path: string | null | Ref<string | null>) => {
  const supabase = useSupabaseClient();
  const pathRef = computed(() =>
    typeof path === "string" ? path : path?.value ?? null,
  );

  return computed(() => {
    const p = pathRef.value;
    if (!p) return null;
    return supabase.storage.from("user-assets").getPublicUrl(p).data.publicUrl;
  });
};