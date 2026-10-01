import { getPdfDocument, isMobilePdfHost, loadPdfjs } from "@/lib/pdfjs-worker";
import {
  DEFAULT_TEXT_COLOR,
  type PdfTextLine,
} from "@/lib/pdf-edit-text";

export type OcrProgress = {
  pct: number;
  status: string;
};

function labelForStatus(status: string) {
  if (status.includes("loading tesseract")) return "Cargando el motor OCR…";
  if (status.includes("initializing")) return "Preparando el español…";
  if (status.includes("loading language")) return "Cargando el modelo de idioma…";
  if (status.includes("recognizing")) return "Leyendo la foto de la página…";
  return "OCR en este navegador…";
}

export async function ocrPdfPage(
  data: ArrayBuffer,
  pageIndex: number,
  onProgress?: (info: OcrProgress) => void,
): Promise<PdfTextLine[]> {
  const pdfjs = await loadPdfjs();
  const task = await getPdfDocument(data);
  const pdf = await task.promise;
  const page = await pdf.getPage(pageIndex + 1);
  const view = page.view;
  const pageWidth = view[2] - view[0];
  const pageHeight = view[3] - view[1];
  const viewport = page.getViewport({
    scale: isMobilePdfHost() ? 1.15 : 2,
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await page.render({
    canvas,
    viewport,
    annotationMode: pdfjs.AnnotationMode.DISABLE,
  }).promise;
  await task.destroy();

  const tesseract = await import("tesseract.js");
  const createWorker =
    tesseract.createWorker ??
    (tesseract as { default?: { createWorker?: typeof tesseract.createWorker } })
      .default?.createWorker;
  if (!createWorker) {
    throw new Error("No se pudo cargar Tesseract en este navegador.");
  }
  const worker = await createWorker("spa", 1, {
    workerPath: "/tesseract/worker.min.js",
    corePath: "/tesseract-core",
    langPath: "/tessdata",
    gzip: true,
    workerBlobURL: false,
    logger: (message) => {
      onProgress?.({
        pct: Math.round((message.progress || 0) * 100),
        status: labelForStatus(message.status || ""),
      });
    },
  });
  try {
    const result = await worker.recognize(canvas, {}, { text: true, blocks: true });
    const lines: PdfTextLine[] = [];
    const blocks = result.data.blocks || [];
    let index = 0;
    const pushBox = (
      text: string,
      box: { x0: number; y0: number; x1: number; y1: number },
      baselineY?: number,
    ) => {
      const clean = text.replace(/\s+/g, " ").trim();
      if (clean.length < 2) return;
      const x0 = box.x0;
      const y0 = box.y0;
      const x1 = box.x1;
      const y1 = box.y1;
      const widthPx = Math.max(8, x1 - x0);
      const heightPx = Math.max(10, y1 - y0);
      const x = (x0 / canvas.width) * pageWidth;
      const height = (heightPx / canvas.height) * pageHeight;
      const baseline = baselineY ?? y1;
      const y = pageHeight - (baseline / canvas.height) * pageHeight;
      const fontSize = Math.max(9, Math.min(28, height * 0.78));
      lines.push({
        id: `ocr-p${pageIndex}-l${index}`,
        pageIndex,
        text: clean,
        original: clean,
        x,
        y,
        width: (widthPx / canvas.width) * pageWidth,
        height,
        fontSize,
        originalFontSize: fontSize,
        bold: false,
        originalBold: false,
        italic: false,
        underline: false,
        color: DEFAULT_TEXT_COLOR,
        originalColor: DEFAULT_TEXT_COLOR,
        fontHint: "Tinos-Regular",
        originalFontHint: "Tinos-Regular",
        pageWidth,
        pageHeight,
        leftPct: x0 / canvas.width,
        topPct: y0 / canvas.height,
        widthPct: widthPx / canvas.width,
        heightPct: heightPx / canvas.height,
        fromOcr: true,
      });
      index += 1;
    };
    for (const block of blocks) {
      for (const para of block.paragraphs || []) {
        const nested = para.lines || [];
        if (nested.length) {
          for (const line of nested) {
            pushBox(line.text || "", line.bbox, line.baseline?.y0);
          }
        } else if (para.text) {
          pushBox(para.text, para.bbox);
        }
      }
    }
    if (lines.length === 0) {
      const chunks = result.data.text
        .split(/\n+/)
        .map((part) => part.replace(/\s+/g, " ").trim())
        .filter((part) => part.length >= 2);
      chunks.forEach((chunk, i) => {
        const top = 40 + i * 36;
        pushBox(chunk, {
          x0: 40,
          y0: top,
          x1: canvas.width - 40,
          y1: top + 28,
        });
      });
    }
    return lines;
  } finally {
    await worker.terminate();
  }
}
