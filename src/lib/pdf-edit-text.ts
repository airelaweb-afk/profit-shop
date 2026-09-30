import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { loadPdfjs } from "@/lib/pdfjs-worker";

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
  pageWidth: number;
  pageHeight: number;
  /** Viewport fractions (top-left origin) so the overlay matches the painted page. */
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

export type PdfTextExtract = {
  pageCount: number;
  pages: { width: number; height: number }[];
  lines: PdfTextLine[];
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
  viewport: { width: number; height: number; convertToViewportPoint: (x: number, y: number) => number[] },
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
  for (let number = 1; number <= pageCount; number += 1) {
    const page = await pdf.getPage(number);
    const view = page.view;
    const pageWidth = view[2] - view[0];
    const pageHeight = view[3] - view[1];
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ width: pageWidth, height: pageHeight });
    const content = await page.getTextContent();
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
      items.push({
        pageIndex: number - 1,
        str: str.trim(),
        x,
        y,
        width,
        height,
        fontSize,
        bold: isBoldFont(fontName) || isBoldFont(family),
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
  };
}

export async function applyTextEdits(
  data: ArrayBuffer,
  lines: PdfTextLine[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(new Uint8Array(copyBuffer(data)), {
    ignoreEncryption: true,
  });
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  for (const line of lines) {
    if (line.text === line.original) continue;
    const page = pages[line.pageIndex];
    if (!page) continue;
    const next = forWinAnsi(line.text).slice(0, 600);
    const size = Math.max(7, Math.min(line.fontSize || 11, 28));
    const font = line.bold ? boldFont : regular;
    const writtenWidth = font.widthOfTextAtSize(next || " ", size);
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
    page.drawText(next, {
      x: line.x,
      y: line.y,
      size,
      font,
      color: rgb(0.07, 0.06, 0.05),
      maxWidth: Math.max(line.width, writtenWidth, 24),
    });
  }
  return doc.save({ useObjectStreams: true });
}

export async function createSampleArticle(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.1, 0.09, 0.08);
  const muted = rgb(0.32, 0.3, 0.28);
  page.drawText("Cartel de prueba", {
    x: 56,
    y: 780,
    size: 22,
    font: bold,
    color: ink,
  });
  page.drawText(
    "Este PDF no es un formulario: el texto esta en la pagina, como un cartel.",
    { x: 56, y: 748, size: 11, font, color: muted },
  );
  page.drawText("Descubre como vivir del interiorismo", {
    x: 56,
    y: 700,
    size: 16,
    font: bold,
    color: ink,
  });
  page.drawText(
    "Si sabes cambiar esta frase, la herramienta funciona. No hace falta Adobe.",
    { x: 56, y: 676, size: 11, font, color: ink, maxWidth: 480 },
  );
  page.drawText("Reserva tu plaza. Anio 2026. Madrid.", {
    x: 56,
    y: 630,
    size: 12,
    font,
    color: ink,
  });
  page.drawText("NOTON", {
    x: 56,
    y: 596,
    size: 14,
    font: bold,
    color: ink,
  });
  page.drawText("Pulsa una linea azulada, escribe y guarda el PDF.", {
    x: 56,
    y: 560,
    size: 11,
    font,
    color: muted,
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
