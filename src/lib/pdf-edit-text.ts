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
  pageWidth: number;
  pageHeight: number;
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
  pageWidth: number;
  pageHeight: number;
};

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
        pageWidth: first.pageWidth,
        pageHeight: first.pageHeight,
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
      items.push({
        pageIndex: number - 1,
        str: str.trim(),
        x,
        y,
        width,
        height,
        fontSize,
        pageWidth,
        pageHeight,
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
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  for (const line of lines) {
    if (line.text === line.original) continue;
    const page = pages[line.pageIndex];
    if (!page) continue;
    const next = forWinAnsi(line.text).slice(0, 600);
    const size = Math.max(7, Math.min(line.fontSize || 11, 22));
    const writtenWidth = font.widthOfTextAtSize(next || " ", size);
    page.drawRectangle({
      x: Math.max(0, line.x - 1),
      y: Math.max(0, line.y - 1.2),
      width: Math.min(
        line.pageWidth - line.x + 1,
        Math.max(line.width, writtenWidth) + 3,
      ),
      height: Math.max(line.height, size) + 2.4,
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
