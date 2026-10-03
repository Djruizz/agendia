import { useMutation } from "@tanstack/vue-query";
import { FriendlyError } from "~/utils/mutationErrors";
import { compressImage } from "~/utils/imageCompression";

const ALLOWED_EXTS = ["png", "jpg", "jpeg", "webp"] as const;
const MAX_RAW_BYTES = 15_000_000; // Permite fotos de hasta 15MB ya que se comprimen client-side

const getExt = (name: string): string | undefined => name.split(".").pop()?.toLowerCase();

export const useUploadServiceImage = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const ext = getExt(file.name);
      if (!ext || !ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])) {
        throw new FriendlyError("Formato no soportado (usa png, jpg, jpeg o webp)");
      }
      if (file.size > MAX_RAW_BYTES) {
        throw new FriendlyError("La imagen original supera el máximo permitido de 15MB");
      }

      // Comprimir en el navegador antes de enviar a Supabase Storage
      const compressed = await compressImage(file, {
        maxWidth: 1000,
        maxHeight: 1000,
        quality: 0.82,
        outputFormat: "image/webp",
      });

      const finalExt = getExt(compressed.name) || "webp";
      const path = `services/${user.value!.sub}/service-${crypto.randomUUID()}.${finalExt}`;

      const { error } = await supabase.storage
        .from("user-assets")
        .upload(path, compressed, { upsert: false, contentType: compressed.type });

      if (error) throw error;
      return path;
    },
  });
};

export const useRemoveServiceImage = () => {
  const supabase = useSupabaseClient();

  return useMutation({
    mutationFn: async (path: string) => {
      if (!path) return;
      const { error } = await supabase.storage.from("user-assets").remove([path]);
      if (error) throw error;
    },
  });
};

export const useServiceImagePublicUrl = (
  path: string | null | undefined | Ref<string | null | undefined>,
) => {
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
