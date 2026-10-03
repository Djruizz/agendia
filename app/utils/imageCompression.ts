export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: "image/webp" | "image/jpeg";
}

/**
 * Comprime y redimensiona una imagen en el navegador del cliente antes de subirla
 * a Supabase Storage. Convierte fotos pesadas (8-15 MB) de celulares en archivos WebP
 * ultralivianos (~60-140 KB) protegiendo el almacenamiento y la cuota de transferencia.
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  // SVGs no se rasterizan ni comprimen con canvas
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    return file;
  }

  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    outputFormat = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calcular nuevas dimensiones conservando aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback si no hay soporte para canvas 2D
        resolve(file);
        return;
      }

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          const ext = outputFormat === "image/webp" ? "webp" : "jpg";
          const newFileName = `${baseName}.${ext}`;

          const compressedFile = new File([blob], newFileName, {
            type: blob.type || outputFormat,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        outputFormat,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo procesar la imagen seleccionada."));
    };

    img.src = objectUrl;
  });
}
