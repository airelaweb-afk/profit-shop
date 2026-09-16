const MAX_EDGE = 720;
const MAX_DATA_URL = 380_000;

export function readLogoFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Sube un PNG, JPG o WebP."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("El archivo pesa demasiado (máximo 5 MB)."));
      return;
    }

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(
        1,
        MAX_EDGE / Math.max(image.width, image.height, 1),
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("No se pudo leer el logo."));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);

      const keepAlpha =
        file.type === "image/png" || file.type === "image/webp";
      let dataUrl = keepAlpha
        ? canvas.toDataURL("image/png")
        : canvas.toDataURL("image/jpeg", 0.86);
      if (dataUrl.length > MAX_DATA_URL) {
        dataUrl = canvas.toDataURL("image/jpeg", 0.72);
      }
      if (dataUrl.length > MAX_DATA_URL) {
        reject(
          new Error(
            "El logo sigue siendo muy grande. Prueba una imagen más simple.",
          ),
        );
        return;
      }
      resolve(dataUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo abrir esa imagen."));
    };
    image.src = objectUrl;
  });
}
