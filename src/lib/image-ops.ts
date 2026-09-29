import { zipSync } from "fflate";
import { formatBytes } from "@/lib/pdf-ops";

export { formatBytes };

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_FILES = 20;
export const MAX_EDGE = 8000;

export type OutFormat = "jpeg" | "png" | "webp";
export type CropNorm = { x: number; y: number; w: number; h: number };
export type Turn = 0 | 90 | 180 | 270;

export function isHeicFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif"
  );
}

export function isImageFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (isHeicFile(file)) return true;
  return (
    type.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif")
  );
}

export function mimeFor(format: OutFormat) {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  return "image/jpeg";
}

export function extFor(format: OutFormat) {
  if (format === "png") return "png";
  if (format === "webp") return "webp";
  return "jpg";
}

export function suggestedOutName(original: string, suffix: string, ext: string) {
  const base = original.replace(/\.[^.]+$/, "") || "imagen";
  return `${base}-${suffix}.${ext}`;
}

export async function loadBitmap(file: File) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name} pesa más de 25 MB.`);
  }
  if (isHeicFile(file)) {
    const { heicTo } = await import("heic-to/next");
    return heicTo({ blob: file, type: "bitmap" });
  }
  try {
    return await createImageBitmap(file);
  } catch {
    throw new Error(
      `No se pudo abrir ${file.name}. Prueba JPG, PNG, WebP o HEIC.`,
    );
  }
}

function clampCrop(crop: CropNorm | undefined) {
  if (!crop) return { x: 0, y: 0, w: 1, h: 1 };
  const x = Math.min(1, Math.max(0, crop.x));
  const y = Math.min(1, Math.max(0, crop.y));
  const w = Math.min(1 - x, Math.max(0.02, crop.w));
  const h = Math.min(1 - y, Math.max(0.02, crop.h));
  return { x, y, w, h };
}

export async function exportImage(input: {
  bitmap: ImageBitmap;
  format: OutFormat;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  rotate?: Turn;
  crop?: CropNorm;
  fill?: string;
}) {
  const crop = clampCrop(input.crop);
  const srcW = input.bitmap.width;
  const srcH = input.bitmap.height;
  const sx = Math.round(crop.x * srcW);
  const sy = Math.round(crop.y * srcH);
  const sw = Math.max(1, Math.round(crop.w * srcW));
  const sh = Math.max(1, Math.round(crop.h * srcH));
  const turn = input.rotate ?? 0;
  const swapped = turn === 90 || turn === 270;
  let outW = swapped ? sh : sw;
  let outH = swapped ? sw : sh;
  const maxW = input.maxWidth && input.maxWidth > 0 ? input.maxWidth : outW;
  const maxH = input.maxHeight && input.maxHeight > 0 ? input.maxHeight : outH;
  const scale = Math.min(1, maxW / outW, maxH / outH, MAX_EDGE / outW, MAX_EDGE / outH);
  outW = Math.max(1, Math.round(outW * scale));
  outH = Math.max(1, Math.round(outH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo pintar la imagen.");
  if (input.format === "jpeg") {
    ctx.fillStyle = input.fill || "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
  }
  ctx.save();
  if (turn === 90) {
    ctx.translate(outW, 0);
    ctx.rotate(Math.PI / 2);
  } else if (turn === 180) {
    ctx.translate(outW, outH);
    ctx.rotate(Math.PI);
  } else if (turn === 270) {
    ctx.translate(0, outH);
    ctx.rotate(-Math.PI / 2);
  }
  const drawW = turn === 90 || turn === 270 ? outH : outW;
  const drawH = turn === 90 || turn === 270 ? outW : outH;
  ctx.drawImage(input.bitmap, sx, sy, sw, sh, 0, 0, drawW, drawH);
  ctx.restore();

  const mime = mimeFor(input.format);
  const quality = Math.min(0.95, Math.max(0.4, input.quality));
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error("No se pudo guardar la imagen."))),
      mime,
      input.format === "png" ? undefined : quality,
    );
  });
  return blob;
}

export async function blobToBytes(blob: Blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

export function zipBlobs(files: { name: string; bytes: Uint8Array }[]) {
  const record: Record<string, Uint8Array> = {};
  for (const file of files) record[file.name] = file.bytes;
  return zipSync(record);
}

export { saveBlob as downloadBlob } from "@/lib/save-file";
