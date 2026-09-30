import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import * as fontkitNs from "@pdf-lib/fontkit";

function fontkit() {
  const rec = fontkitNs as unknown as {
    create?: (bytes: Uint8Array) => unknown;
    default?: { create?: (bytes: Uint8Array) => unknown };
  };
  if (typeof rec.create === "function") return rec;
  if (typeof rec.default?.create === "function") return rec.default;
  throw new Error("No se pudo cargar el motor de fuentes.");
}
import {
  extractEmbeddedFonts,
  pickEmbeddedFont,
} from "@/lib/pdf-embedded-fonts";
import { loadPdfjs } from "@/lib/pdfjs-worker";

export const TINOS_FONT_URL = "/fonts/Tinos-Regular.ttf";

export type PdfTextLine = {
  id: string;
  pageIndex: number;
  text: string;
  original: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  bold: boolean;
  fontHint: string;
  pageWidth: number;
  pageHeight: number;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  fromOcr?: boolean;
};

export type PdfTextExtract = {
  pageCount: number;
  pages: { width: number; height: number }[];
  lines: PdfTextLine[];
  fontNames: string[];
};

function copyBuffer(data: ArrayBuffer) {
  const copy = new ArrayBuffer(data.byteLength);
  new Uint8Array(copy).set(new Uint8Array(data));
  return copy;
}

function forWinAnsi(text: string) {
  return [...text]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (char === "€") return "EUR";
      if (char === "—" || char === "–") return "-";
      if (char === "“" || char === "”" || char === "„") return '"';
      if (char === "‘" || char === "’") return "'";
      if (code > 255) return "?";
      return char;
    })
    .join("");
}

type RawItem = {
  pageIndex: number;
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  bold: boolean;
  fontHint: string;
  pageWidth: number;
  pageHeight: number;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

function isBoldFont(name: string) {
  return /bold|black|heavy|semibold/i.test(name);
}

function overlayFractions(
  viewport: {
    width: number;
    height: number;
    convertToViewportPoint: (x: number, y: number) => number[];
  },
  x: number,
  y: number,
  width: number,
  fontSize: number,
) {
  const ascent = fontSize * 0.75;
  const descent = fontSize * 0.22;
  const [left] = viewport.convertToViewportPoint(x, y);
  const [right] = viewport.convertToViewportPoint(x + Math.max(width, 4), y);
  const [, top] = viewport.convertToViewportPoint(x, y + ascent);
  const [, bottom] = viewport.convertToViewportPoint(x, y - descent);
  const pxLeft = Math.min(left, right);
  const pxTop = Math.min(top, bottom);
  return {
    leftPct: pxLeft / viewport.width,
    topPct: pxTop / viewport.height,
    widthPct: Math.abs(right - left) / viewport.width,
    heightPct: Math.abs(bottom - top) / viewport.height,
  };
}

function groupLines(items: RawItem[]): PdfTextLine[] {
  const sorted = [...items].sort(
    (left, right) =>
      left.pageIndex - right.pageIndex ||
      right.y - left.y ||
      left.x - right.x,
  );
  const buckets: RawItem[][] = [];
  for (const item of sorted) {
    const current = buckets.at(-1);
    const seed = current?.[0];
    const slop = Math.max(2.2, item.fontSize * 0.32);
    if (
      current &&
      seed &&
      seed.pageIndex === item.pageIndex &&
      Math.abs(seed.y - item.y) <= slop
    ) {
      current.push(item);
      continue;
    }
    buckets.push([item]);
  }
  return buckets
    .map((parts, index) => {
      parts.sort((left, right) => left.x - right.x);
      const x = Math.min(...parts.map((part) => part.x));
      const y = Math.min(...parts.map((part) => part.y));
      const right = Math.max(...parts.map((part) => part.x + part.width));
      const top = Math.max(...parts.map((part) => part.y + part.height));
      const text = parts
        .map((part) => part.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const fontSize =
        parts.reduce((sum, part) => sum + part.fontSize, 0) / parts.length;
      const first = parts[0];
      const leftPct = Math.min(...parts.map((part) => part.leftPct));
      const topPct = Math.min(...parts.map((part) => part.topPct));
      const rightPct = Math.max(
        ...parts.map((part) => part.leftPct + part.widthPct),
      );
      const bottomPct = Math.max(
        ...parts.map((part) => part.topPct + part.heightPct),
      );
      const hintCounts = new Map<string, number>();
      for (const part of parts) {
        hintCounts.set(part.fontHint, (hintCounts.get(part.fontHint) || 0) + 1);
      }
      const fontHint =
        [...hintCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
        first.fontHint;
      return {
        id: `p${first.pageIndex}-l${index}`,
        pageIndex: first.pageIndex,
        text,
        original: text,
        x,
        y,
        width: Math.max(8, right - x),
        height: Math.max(fontSize * 0.85, top - y),
        fontSize,
        bold: parts.some((part) => part.bold),
        fontHint,
        pageWidth: first.pageWidth,
        pageHeight: first.pageHeight,
        leftPct,
        topPct,
        widthPct: Math.max(0.04, rightPct - leftPct),
        heightPct: Math.max(0.01, bottomPct - topPct),
      };
    })
    .filter((line) => line.text.length > 0);
}

export async function extractPdfText(data: ArrayBuffer): Promise<PdfTextExtract> {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({
    data: new Uint8Array(copyBuffer(data)),
    useWasm: false,
  });
  const pdf = await task.promise;
  const pageCount = pdf.numPages;
  const pages: { width: number; height: number }[] = [];
  const items: RawItem[] = [];
  const fontNames = new Set<string>();
  for (let number = 1; number <= pageCount; number += 1) {
    const page = await pdf.getPage(number);
    const view = page.view;
    const pageWidth = view[2] - view[0];
    const pageHeight = view[3] - view[1];
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ width: pageWidth, height: pageHeight });
    const content = await page.getTextContent();
    await page.getOperatorList();
    for (const item of content.items) {
      if (!("str" in item) || typeof item.str !== "string") continue;
      const str = item.str.replace(/\s+/g, " ");
      if (!str.trim()) continue;
      const transform = item.transform as number[];
      const x = transform[4];
      const y = transform[5];
      const fontSize =
        Math.hypot(transform[2], transform[3]) ||
        Math.hypot(transform[0], transform[1]) ||
        11;
      const width = Math.max(item.width || fontSize * str.length * 0.5, 4);
      const height = Math.max(item.height || fontSize, fontSize * 0.8);
      const fontName =
        "fontName" in item && typeof item.fontName === "string"
          ? item.fontName
          : "";
      const family = content.styles?.[fontName]?.fontFamily ?? "";
      let fontHint = fontName;
      try {
        const face = page.commonObjs.get(fontName) as { name?: string } | undefined;
        if (face?.name) fontHint = face.name;
      } catch {
        fontHint = fontName || family;
      }
      if (fontHint) fontNames.add(fontHint);
      items.push({
        pageIndex: number - 1,
        str: str.trim(),
        x,
        y,
        width,
        height,
        fontSize,
        bold: isBoldFont(fontName) || isBoldFont(family) || isBoldFont(fontHint),
        fontHint,
        pageWidth,
        pageHeight,
        ...overlayFractions(viewport, x, y, width, fontSize),
      });
    }
  }
  await task.destroy();
  return {
    pageCount,
    pages,
    lines: groupLines(items),
    fontNames: [...fontNames],
  };
}

async function tinosBytes() {
  const response = await fetch(TINOS_FONT_URL);
  if (!response.ok) return null;
  return new Uint8Array(await response.arrayBuffer());
}

export async function applyTextEdits(
  data: ArrayBuffer,
  lines: PdfTextLine[],
): Promise<{ bytes: Uint8Array; usedEmbedded: boolean }> {
  const doc = await PDFDocument.load(new Uint8Array(copyBuffer(data)), {
    ignoreEncryption: true,
  });
  doc.registerFontkit(fontkit() as never);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const files = extractEmbeddedFonts(doc);
  const needsTinos = lines.some(
    (line) =>
      line.text !== line.original && /tinos/i.test(line.fontHint || ""),
  );
  if (needsTinos && !pickEmbeddedFont(files, "Tinos")) {
    const extra = await tinosBytes();
    if (extra) files.push({ name: "Tinos-Regular", bytes: extra });
  }
  const cache = new Map<string, PDFFont>();
  async function fontFor(line: PdfTextLine): Promise<{ font: PDFFont; custom: boolean }> {
    const file = pickEmbeddedFont(files, line.fontHint);
    if (file) {
      const cached = cache.get(file.name);
      if (cached) return { font: cached, custom: true };
      try {
        const embedded = await doc.embedFont(file.bytes, { subset: true });
        cache.set(file.name, embedded);
        return { font: embedded, custom: true };
      } catch {
        /* Helvetica */
      }
    }
    return { font: line.bold ? boldFont : regular, custom: false };
  }
  const pages = doc.getPages();
  let usedEmbedded = false;
  for (const line of lines) {
    if (line.text === line.original) continue;
    const page = pages[line.pageIndex];
    if (!page) continue;
    const chosen = await fontFor(line);
    if (chosen.custom) usedEmbedded = true;
    const raw = line.text.slice(0, 600);
    const next = chosen.custom ? raw : forWinAnsi(raw);
    const size = Math.max(7, Math.min(line.fontSize || 11, 28));
    const writtenWidth = chosen.font.widthOfTextAtSize(next || " ", size);
    const ascent = size * 0.75;
    const descent = size * 0.25;
    page.drawRectangle({
      x: Math.max(0, line.x - 1),
      y: Math.max(0, line.y - descent),
      width: Math.min(
        line.pageWidth - line.x + 1,
        Math.max(line.width, writtenWidth) + 4,
      ),
      height: ascent + descent + 1.2,
      color: rgb(1, 1, 1),
    });
    if (!next.trim()) continue;
    try {
      page.drawText(next, {
        x: line.x,
        y: line.y,
        size,
        font: chosen.font,
        color: rgb(0.07, 0.06, 0.05),
        maxWidth: Math.max(line.width, writtenWidth, 24),
      });
    } catch {
      page.drawText(forWinAnsi(raw), {
        x: line.x,
        y: line.y,
        size,
        font: line.bold ? boldFont : regular,
        color: rgb(0.07, 0.06, 0.05),
        maxWidth: Math.max(line.width, writtenWidth, 24),
      });
    }
  }
  return {
    bytes: await doc.save({ useObjectStreams: true }),
    usedEmbedded,
  };
}

export async function createSampleArticle(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit() as never);
  const tinos = await tinosBytes();
  const serif = tinos
    ? await doc.embedFont(tinos, { subset: true })
    : await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = tinos
    ? serif
    : await doc.embedFont(StandardFonts.TimesRomanBold);
  const page = doc.addPage([595.28, 841.89]);
  const ink = rgb(0.1, 0.09, 0.08);
  const muted = rgb(0.32, 0.3, 0.28);
  page.drawText("Cartel de prueba", {
    x: 56,
    y: 780,
    size: 22,
    font: serifBold,
    color: ink,
  });
  page.drawText(
    "Este PDF no es un formulario: el texto esta en la pagina, como un cartel.",
    { x: 56, y: 748, size: 11, font: serif, color: muted },
  );
  page.drawText("Descubre como vivir del interiorismo", {
    x: 56,
    y: 700,
    size: 16,
    font: serifBold,
    color: ink,
  });
  page.drawText(
    "Si sabes cambiar esta frase, la herramienta funciona. No hace falta Adobe.",
    { x: 56, y: 676, size: 11, font: serif, color: ink, maxWidth: 480 },
  );
  page.drawText("Reserva tu plaza. Anio 2026. Madrid.", {
    x: 56,
    y: 630,
    size: 12,
    font: serif,
    color: ink,
  });
  page.drawText("NOTON", {
    x: 56,
    y: 596,
    size: 14,
    font: serifBold,
    color: ink,
  });
  page.drawText("Pulsa una linea azulada, escribe y guarda el PDF.", {
    x: 56,
    y: 560,
    size: 11,
    font: serif,
    color: muted,
  });
  const bytes = await doc.save();
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export async function createSampleScan(): Promise<ArrayBuffer> {
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 990;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo pintar el escaneo de prueba.");
  ctx.fillStyle = "#efe6d6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#d9cbb3";
  ctx.fillRect(28, 36, 644, 918);
  ctx.fillStyle = "#1a1714";
  ctx.font = "32px Times New Roman, serif";
  ctx.fillText("Factura escaneada de prueba", 56, 120);
  ctx.font = "18px Times New Roman, serif";
  ctx.fillStyle = "#3a342c";
  ctx.fillText("Esta pagina es una foto: no hay texto seleccionable.", 56, 180);
  ctx.fillText("Pulsa «Leer con OCR» para que el navegador lea las letras.", 56, 214);
  ctx.fillStyle = "#1a1714";
  ctx.fillText("Cliente: Luna Oficio", 56, 300);
  ctx.fillText("Importe: 40 euros al año en Madrid", 56, 340);
  ctx.fillText("Año 2026. Revisar acentos: cañón, año, Andalucía.", 56, 380);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (next) => (next ? resolve(next) : reject(new Error("No PNG"))),
      "image/png",
    );
  });
  const png = new Uint8Array(await blob.arrayBuffer());
  const doc = await PDFDocument.create();
  const image = await doc.embedPng(png);
  const page = doc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });
  const bytes = await doc.save();
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export function suggestedEditName(originalName: string) {
  const base = originalName.replace(/\.pdf$/i, "").trim() || "documento";
  return `${base}-editado.pdf`;
}
