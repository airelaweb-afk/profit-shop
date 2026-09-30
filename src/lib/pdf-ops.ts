import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { zipSync } from "fflate";
import { MAX_PDF_BYTES } from "@/lib/pdf-fill";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import { saveBytes } from "@/lib/save-file";

export { MAX_PDF_BYTES };

export const MAX_PDF_FILES = 80;
export const MAX_IMAGE_FILES = 80;
export const MAX_RENDER_PAGES = 60;

export function copyBuffer(data: ArrayBuffer) {
  const copy = new ArrayBuffer(data.byteLength);
  new Uint8Array(copy).set(new Uint8Array(data));
  return copy;
}

export function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

export function isImageFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/jpeg" ||
    type === "image/jpg" ||
    type === "image/png" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png")
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function downloadBytes(
  bytes: Uint8Array, filename: string, mime: string,
) {
  return saveBytes(bytes, filename, mime);
}

function friendlyLoadError(caught: unknown): never {
  const message = caught instanceof Error ? caught.message : "";
  if (message.toLowerCase().includes("encrypt") || message.includes("password")) {
    throw new Error(
      "Este PDF tiene contraseña. Quítala en el archivo original y vuelve a subirlo.",
    );
  }
  throw new Error("No se pudo leer el PDF. Prueba con otro archivo.");
}

async function loadPdf(data: ArrayBuffer) {
  try {
    return await PDFDocument.load(new Uint8Array(copyBuffer(data)));
  } catch (caught) {
    friendlyLoadError(caught);
  }
}

export async function countPdfPages(data: ArrayBuffer) {
  const doc = await loadPdf(data);
  return doc.getPageCount();
}

export async function mergePdfs(files: ArrayBuffer[]) {
  if (files.length < 2) throw new Error("Elige al menos dos PDF para unirlos.");
  const out = await PDFDocument.create();
  let pages = 0;
  for (const data of files) {
    if (data.byteLength > MAX_PDF_BYTES) {
      throw new Error("Un archivo pesa más de 20 MB. Usa uno más ligero.");
    }
    const src = await loadPdf(data);
    const copied = await out.copyPages(src, src.getPageIndices());
    for (const page of copied) {
      out.addPage(page);
      pages += 1;
      if (pages > 250) {
        throw new Error("Demasiadas páginas juntas. Parte la tanda.");
      }
    }
  }
  return out.save({ useObjectStreams: true });
}

export function parsePageRanges(input: string, pageCount: number) {
  const trimmed = input.trim();
  if (!trimmed) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }
  const indices = new Set<number>();
  for (const chunk of trimmed.split(/[,;]+/)) {
    const part = chunk.trim();
    if (!part) continue;
    const range = part.match(/^(\d+)\s*(?:[-–]|a)\s*(\d+)$/i);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end < start || end > pageCount) {
        throw new Error(`El rango ${part} no encaja (hay ${pageCount} páginas).`);
      }
      for (let page = start; page <= end; page += 1) indices.add(page - 1);
      continue;
    }
    if (!/^\d+$/.test(part)) {
      throw new Error("Escribe páginas así: 1-3, 5, 8-10.");
    }
    const page = Number(part);
    if (page < 1 || page > pageCount) {
      throw new Error(`La página ${page} no existe (hay ${pageCount}).`);
    }
    indices.add(page - 1);
  }
  if (indices.size === 0) {
    throw new Error("No hay páginas que extraer.");
  }
  return [...indices].sort((a, b) => a - b);
}

export async function extractPdfPages(data: ArrayBuffer, pageIndices: number[]) {
  const src = await loadPdf(data);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pageIndices);
  for (const page of copied) out.addPage(page);
  return out.save({ useObjectStreams: true });
}

export async function splitPdfPerPage(data: ArrayBuffer) {
  const src = await loadPdf(data);
  const count = src.getPageCount();
  if (count > MAX_RENDER_PAGES) {
    throw new Error(
      `Este PDF tiene ${count} páginas. Parte antes o extrae un rango.`,
    );
  }
  const files: { name: string; bytes: Uint8Array }[] = [];
  for (let index = 0; index < count; index += 1) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [index]);
    out.addPage(page);
    files.push({
      name: `pagina-${index + 1}.pdf`,
      bytes: await out.save({ useObjectStreams: true }),
    });
  }
  return files;
}

export function zipFiles(files: { name: string; bytes: Uint8Array }[]) {
  const record: Record<string, Uint8Array> = {};
  for (const file of files) record[file.name] = file.bytes;
  return zipSync(record);
}

const A4 = { width: 595.28, height: 841.89 };

export async function imagesToPdf(
  images: { bytes: ArrayBuffer; kind: "jpg" | "png" }[],
) {
  if (images.length === 0) throw new Error("Elige al menos una imagen.");
  const out = await PDFDocument.create();
  for (const image of images) {
    const embedded =
      image.kind === "png"
        ? await out.embedPng(new Uint8Array(image.bytes))
        : await out.embedJpg(new Uint8Array(image.bytes));
    const page = out.addPage([A4.width, A4.height]);
    const margin = 24;
    const maxW = A4.width - margin * 2;
    const maxH = A4.height - margin * 2;
    const scale = Math.min(maxW / embedded.width, maxH / embedded.height, 1);
    const width = embedded.width * scale;
    const height = embedded.height * scale;
    page.drawImage(embedded, {
      x: (A4.width - width) / 2,
      y: (A4.height - height) / 2,
      width,
      height,
    });
  }
  return out.save({ useObjectStreams: true });
}

async function renderPdfPages(
  data: ArrayBuffer,
  options: { scale: number; type: "image/jpeg" | "image/png"; quality: number },
) {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({
    data: new Uint8Array(copyBuffer(data)),
    useWasm: false,
  });
  const pdf = await task.promise;
  if (pdf.numPages > MAX_RENDER_PAGES) {
    await pdf.cleanup();
    await task.destroy();
    throw new Error(
      `Este PDF tiene ${pdf.numPages} páginas. Usa uno más corto o extrae un rango.`,
    );
  }
  const pages: { name: string; bytes: Uint8Array }[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const viewport = page.getViewport({ scale: options.scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    await page.render({ canvas, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (next) => (next ? resolve(next) : reject(new Error("No se pudo pintar la página."))),
        options.type,
        options.quality,
      );
    });
    pages.push({
      name: `pagina-${number}${options.type === "image/png" ? ".png" : ".jpg"}`,
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
  }
  await pdf.cleanup();
  await task.destroy();
  return pages;
}

export async function pdfToJpegZip(data: ArrayBuffer) {
  const pages = await renderPdfPages(data, {
    scale: 1.6,
    type: "image/jpeg",
    quality: 0.82,
  });
  return zipSync(
    Object.fromEntries(pages.map((page) => [page.name, page.bytes])),
  );
}

export async function compressPdf(
  data: ArrayBuffer,
  strength: "light" | "strong",
) {
  if (strength === "light") {
    const doc = await loadPdf(data);
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setCreator("Luna Oficio");
    const bytes = await doc.save({ useObjectStreams: true });
    return { bytes, rasterized: false };
  }
  const pages = await renderPdfPages(data, {
    scale: 1.25,
    type: "image/jpeg",
    quality: 0.52,
  });
  const out = await PDFDocument.create();
  for (const page of pages) {
    const image = await out.embedJpg(page.bytes);
    const sheet = out.addPage([image.width, image.height]);
    sheet.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  return {
    bytes: await out.save({ useObjectStreams: true }),
    rasterized: true,
  };
}

export function suggestedOutName(original: string, suffix: string, ext: string) {
  const base = original.replace(/\.[^.]+$/, "") || "documento";
  return `${base}-${suffix}.${ext}`;
}

export async function rotatePdf(data: ArrayBuffer, angle: 90 | 180 | 270) {
  const doc = await loadPdf(data);
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((((current + angle) % 360) + 360) % 360));
  }
  return doc.save({ useObjectStreams: true });
}

export async function removePdfPages(data: ArrayBuffer, pagesToRemove: string) {
  const src = await loadPdf(data);
  const count = src.getPageCount();
  if (!pagesToRemove.trim()) {
    throw new Error("Escribe las páginas que quieres quitar, por ejemplo 2, 5-7.");
  }
  const remove = new Set(parsePageRanges(pagesToRemove, count));
  const keep = Array.from({ length: count }, (_, index) => index).filter(
    (index) => !remove.has(index),
  );
  if (keep.length === 0) {
    throw new Error("Quitarías todas las páginas. Deja al menos una.");
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, keep);
  for (const page of copied) out.addPage(page);
  return { bytes: await out.save({ useObjectStreams: true }), removed: remove.size, kept: keep.length };
}

export async function watermarkPdf(data: ArrayBuffer, text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Escribe el texto de la marca de agua.");
  if (trimmed.length > 72) throw new Error("Máximo 72 caracteres.");
  const doc = await loadPdf(data);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(18, Math.min(width, height) / 9);
    const tw = font.widthOfTextAtSize(trimmed, size);
    page.drawText(trimmed, {
      x: Math.max(24, (width - tw) / 2),
      y: height / 2,
      size,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity: 0.28,
      rotate: degrees(28),
    });
  }
  return doc.save({ useObjectStreams: true });
}

export async function numberPdfPages(data: ArrayBuffer, start = 1) {
  const from = Number.isFinite(start) ? Math.max(1, Math.floor(start)) : 1;
  const doc = await loadPdf(data);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const label = String(from + index);
    const size = 11;
    const tw = font.widthOfTextAtSize(label, size);
    page.drawText(label, {
      x: (width - tw) / 2,
      y: 16,
      size,
      font,
      color: rgb(0.28, 0.28, 0.28),
    });
  });
  return doc.save({ useObjectStreams: true });
}
