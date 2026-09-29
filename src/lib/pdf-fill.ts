import {
  LineCapStyle,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFTextField,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

export const MAX_PDF_BYTES = 20 * 1024 * 1024;

export type PdfFormField = {
  name: string;
  kind: "text" | "check" | "choice";
  value: string;
  checked: boolean;
  options: string[];
};

export type PdfStampKind =
  | "text"
  | "date"
  | "signature"
  | "check"
  | "cross";

export type MarkSize = "S" | "M" | "L";

export type PdfStamp = {
  id: string;
  pageIndex: number;
  kind: PdfStampKind;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  imageDataUrl: string;
  fontSize: number;
};

export const MARK_PX: Record<MarkSize, number> = {
  S: 9,
  M: 12,
  L: 17,
};

export const TEXT_SIZE: Record<MarkSize, number> = {
  S: 8,
  M: 11,
  L: 14,
};

export function markBox(size: MarkSize) {
  const side = MARK_PX[size];
  return { width: side, height: side };
}

export function clickToPdfPoint(
  event: { clientX: number; clientY: number },
  box: { getBoundingClientRect: () => DOMRect },
  pageWidth: number,
  pageHeight: number,
) {
  const rect = box.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * pageWidth;
  const y =
    pageHeight - ((event.clientY - rect.top) / rect.height) * pageHeight;
  return {
    x: Math.min(pageWidth, Math.max(0, x)),
    y: Math.min(pageHeight, Math.max(0, y)),
  };
}

export async function createBlankSheet(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.1, 0.08);
  const muted = rgb(0.45, 0.4, 0.35);

  page.drawText("Documento para firmar", {
    x: 56,
    y: 780,
    size: 18,
    font: bold,
    color: ink,
  });
  page.drawText(
    "Hoja en blanco. Escribe encima y pon la firma. No es una plantilla oficial.",
    {
      x: 56,
      y: 758,
      size: 9,
      font,
      color: muted,
    },
  );

  const lines = [
    "Fecha:",
    "Nombre y apellidos:",
    "NIF / DNI:",
    "Concepto / lo que se firma:",
  ];
  lines.forEach((label, index) => {
    const y = 700 - index * 52;
    page.drawText(label, { x: 56, y, size: 11, font, color: ink });
    page.drawLine({
      start: { x: 56, y: y - 16 },
      end: { x: 539, y: y - 16 },
      thickness: 0.6,
      color: rgb(0.72, 0.66, 0.58),
    });
  });

  page.drawText("Texto", {
    x: 56,
    y: 470,
    size: 11,
    font,
    color: ink,
  });
  page.drawRectangle({
    x: 56,
    y: 220,
    width: 483,
    height: 236,
    borderColor: rgb(0.72, 0.66, 0.58),
    borderWidth: 0.8,
  });

  page.drawText("Firma", {
    x: 56,
    y: 188,
    size: 11,
    font,
    color: ink,
  });
  page.drawRectangle({
    x: 56,
    y: 72,
    width: 240,
    height: 100,
    borderColor: rgb(0.72, 0.66, 0.58),
    borderWidth: 0.8,
  });
  page.drawText("Luna Oficio · el archivo no sale de tu navegador", {
    x: 56,
    y: 44,
    size: 8,
    font,
    color: muted,
  });

  const bytes = await doc.save();
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export async function listPdfFields(data: ArrayBuffer): Promise<PdfFormField[]> {
  try {
    const doc = await PDFDocument.load(data, { ignoreEncryption: false });
    const form = doc.getForm();
    return form.getFields().map((field) => {
      const name = field.getName();
      if (field instanceof PDFTextField) {
        return {
          name,
          kind: "text" as const,
          value: field.getText() ?? "",
          checked: false,
          options: [],
        };
      }
      if (field instanceof PDFCheckBox) {
        return {
          name,
          kind: "check" as const,
          value: "",
          checked: field.isChecked(),
          options: [],
        };
      }
      if (field instanceof PDFDropdown) {
        const selected = field.getSelected();
        return {
          name,
          kind: "choice" as const,
          value: selected[0] ?? "",
          checked: false,
          options: field.getOptions(),
        };
      }
      return {
        name,
        kind: "text" as const,
        value: "",
        checked: false,
        options: [],
      };
    });
  } catch {
    return [];
  }
}

function ink() {
  return rgb(0.07, 0.06, 0.05);
}

function drawCheck(page: PDFPage, stamp: PdfStamp) {
  const { x, y, width: w, height: h } = stamp;
  const t = Math.max(1.15, Math.min(w, h) * 0.16);
  page.drawLine({
    start: { x: x + w * 0.12, y: y + h * 0.48 },
    end: { x: x + w * 0.4, y: y + h * 0.16 },
    thickness: t,
    color: ink(),
    lineCap: LineCapStyle.Round,
  });
  page.drawLine({
    start: { x: x + w * 0.4, y: y + h * 0.16 },
    end: { x: x + w * 0.9, y: y + h * 0.84 },
    thickness: t,
    color: ink(),
    lineCap: LineCapStyle.Round,
  });
}

function drawCross(page: PDFPage, stamp: PdfStamp) {
  const { x, y, width: w, height: h } = stamp;
  const t = Math.max(1.05, Math.min(w, h) * 0.14);
  page.drawLine({
    start: { x: x + w * 0.14, y: y + h * 0.14 },
    end: { x: x + w * 0.86, y: y + h * 0.86 },
    thickness: t,
    color: ink(),
    lineCap: LineCapStyle.Round,
  });
  page.drawLine({
    start: { x: x + w * 0.14, y: y + h * 0.86 },
    end: { x: x + w * 0.86, y: y + h * 0.14 },
    thickness: t,
    color: ink(),
    lineCap: LineCapStyle.Round,
  });
}

function drawStamps(
  page: PDFPage,
  stamps: PdfStamp[],
  font: PDFFont,
  images: Map<string, Awaited<ReturnType<PDFDocument["embedPng"]>>>,
) {
  for (const stamp of stamps) {
    if (stamp.kind === "signature" && stamp.imageDataUrl) {
      const image = images.get(stamp.id);
      if (!image) continue;
      page.drawImage(image, {
        x: stamp.x,
        y: stamp.y,
        width: stamp.width,
        height: stamp.height,
      });
      continue;
    }
    if (stamp.kind === "check") {
      drawCheck(page, stamp);
      continue;
    }
    if (stamp.kind === "cross") {
      drawCross(page, stamp);
      continue;
    }
    const size = stamp.fontSize || 11;
    page.drawText(stamp.text.slice(0, 180), {
      x: stamp.x,
      y: stamp.y,
      size,
      font,
      color: ink(),
      maxWidth: Math.max(80, stamp.width),
    });
  }
}

export async function exportSignedPdf(options: {
  data: ArrayBuffer;
  fields: PdfFormField[];
  stamps: PdfStamp[];
}): Promise<Uint8Array> {
  const doc = await PDFDocument.load(options.data);
  try {
    const form = doc.getForm();
    for (const field of options.fields) {
      try {
        if (field.kind === "text") {
          form.getTextField(field.name).setText(field.value);
        } else if (field.kind === "check") {
          const box = form.getCheckBox(field.name);
          if (field.checked) box.check();
          else box.uncheck();
        } else if (field.kind === "choice" && field.value) {
          form.getDropdown(field.name).select(field.value);
        }
      } catch {
        // Campo raro o de solo lectura: se ignora.
      }
    }
    try {
      form.flatten();
    } catch {
      // Algunos PDF no se pueden aplanar; el resto del documento sí se firma.
    }
  } catch {
    // PDF sin formulario.
  }

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const images = new Map<
    string,
    Awaited<ReturnType<PDFDocument["embedPng"]>>
  >();
  for (const stamp of options.stamps) {
    if (stamp.kind !== "signature" || !stamp.imageDataUrl) continue;
    const png = dataUrlToBytes(stamp.imageDataUrl);
    images.set(stamp.id, await doc.embedPng(png));
  }

  const pages = doc.getPages();
  const byPage = new Map<number, PdfStamp[]>();
  for (const stamp of options.stamps) {
    const list = byPage.get(stamp.pageIndex) ?? [];
    list.push(stamp);
    byPage.set(stamp.pageIndex, list);
  }
  for (const [index, list] of byPage) {
    const page = pages[index];
    if (!page) continue;
    drawStamps(page, list, font, images);
  }

  return doc.save();
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  if (!base64) return new Uint8Array();
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function formatPdfDate(when = new Date()) {
  const day = String(when.getDate()).padStart(2, "0");
  const month = String(when.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${when.getFullYear()}`;
}

export function suggestedFileName(originalName: string) {
  const base = originalName.replace(/\.pdf$/i, "").trim() || "documento";
  return `${base}-firmado.pdf`;
}
