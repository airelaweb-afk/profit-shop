import {
  LineCapStyle,
  PDFArray,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFOptionList,
  PDFRadioGroup,
  PDFRef,
  PDFTextField,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

export const MAX_PDF_BYTES = 80 * 1024 * 1024;

export type PdfFieldWidget = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  option?: string;
};

export type PdfFormField = {
  name: string;
  kind: "text" | "check" | "choice" | "radio";
  value: string;
  checked: boolean;
  options: string[];
  multiline: boolean;
  readOnly: boolean;
  widgets: PdfFieldWidget[];
};

export function clipWidget(
  widget: PdfFieldWidget,
  page: { width: number; height: number },
): PdfFieldWidget | null {
  if (
    page.width < 8 ||
    page.height < 8 ||
    !Number.isFinite(widget.x) ||
    !Number.isFinite(widget.y) ||
    !Number.isFinite(widget.width) ||
    !Number.isFinite(widget.height)
  ) {
    return null;
  }
  const x = Math.min(page.width - 4, Math.max(0, widget.x));
  const y = Math.min(page.height - 4, Math.max(0, widget.y));
  const width = Math.min(widget.width, page.width - x);
  const height = Math.min(widget.height, page.height - y);
  if (width < 4 || height < 4) return null;
  if (width / page.width > 0.96 && height / page.height > 0.96) return null;
  return { ...widget, x, y, width, height };
}

export function humanFieldName(name: string) {
  const parts = name.split(/[.\]]/).map((part) => part.replace(/\[/g, "").trim());
  const last = [...parts].reverse().find((part) => part && !/^\d+$/.test(part));
  return last || name;
}

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

function pageIndexForWidget(
  doc: PDFDocument,
  widget: { P: () => PDFRef | undefined; dict: unknown },
) {
  const pages = doc.getPages();
  const pref = widget.P();
  if (pref) {
    const hit = pages.findIndex((page) => page.ref === pref);
    if (hit >= 0) return hit;
  }
  for (let index = 0; index < pages.length; index += 1) {
    const annots = pages[index].node.lookupMaybe(PDFName.of("Annots"), PDFArray);
    if (!annots) continue;
    for (let i = 0; i < annots.size(); i += 1) {
      try {
        if (annots.lookup(i) === widget.dict) return index;
      } catch {
        // Anotación rota.
      }
    }
  }
  return 0;
}

function widgetsOf(
  doc: PDFDocument,
  field: { acroField: { getWidgets: () => Array<{
    getRectangle: () => { x: number; y: number; width: number; height: number };
    P: () => PDFRef | undefined;
    dict: unknown;
    getOnValue?: () => { decodeText: () => string } | undefined;
  }> } },
  options: string[] = [],
): PdfFieldWidget[] {
  try {
    return field.acroField.getWidgets().map((widget, index) => {
      const rect = widget.getRectangle();
      return {
        pageIndex: pageIndexForWidget(doc, widget),
        x: rect.x,
        y: rect.y,
        width: Math.max(8, rect.width),
        height: Math.max(8, rect.height),
        option: widget.getOnValue?.()?.decodeText() || options[index],
      };
    });
  } catch {
    return [];
  }
}

const emptyField = {
  checked: false,
  options: [] as string[],
  multiline: false,
  readOnly: false,
  widgets: [] as PdfFieldWidget[],
};

export async function listPdfFields(data: ArrayBuffer): Promise<PdfFormField[]> {
  try {
    const doc = await PDFDocument.load(data, { ignoreEncryption: true });
    const form = doc.getForm();
    const out: PdfFormField[] = [];
    for (const field of form.getFields()) {
      const name = field.getName();
      if (!name) continue;
      const readOnly = field.isReadOnly();
      if (field instanceof PDFTextField) {
        out.push({
          ...emptyField,
          name,
          kind: "text",
          value: field.getText() ?? "",
          multiline: field.isMultiline(),
          readOnly,
          widgets: widgetsOf(doc, field),
        });
        continue;
      }
      if (field instanceof PDFCheckBox) {
        out.push({
          ...emptyField,
          name,
          kind: "check",
          value: "",
          checked: field.isChecked(),
          readOnly,
          widgets: widgetsOf(doc, field),
        });
        continue;
      }
      if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
        const selected = field.getSelected();
        out.push({
          ...emptyField,
          name,
          kind: "choice",
          value: selected[0] ?? "",
          options: field.getOptions(),
          readOnly,
          widgets: widgetsOf(doc, field),
        });
        continue;
      }
      if (field instanceof PDFRadioGroup) {
        const options = field.getOptions();
        out.push({
          ...emptyField,
          name,
          kind: "radio",
          value: field.getSelected() ?? "",
          options,
          readOnly,
          widgets: widgetsOf(doc, field, options),
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function applyFormValues(
  doc: PDFDocument,
  fields: PdfFormField[],
) {
  const form = doc.getForm();
  for (const field of fields) {
    if (field.readOnly) continue;
    try {
      if (field.kind === "text") {
        form.getTextField(field.name).setText(field.value);
      } else if (field.kind === "check") {
        const box = form.getCheckBox(field.name);
        if (field.checked) box.check();
        else box.uncheck();
      } else if (field.kind === "choice" && field.value) {
        try {
          form.getDropdown(field.name).select(field.value);
        } catch {
          form.getOptionList(field.name).select(field.value);
        }
      } else if (field.kind === "radio" && field.value) {
        form.getRadioGroup(field.name).select(field.value);
      }
    } catch {
      // Campo raro o de solo lectura: se ignora.
    }
  }
  try {
    const font = await doc.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(font);
  } catch {
    // El visor mostrará el valor al abrir el PDF.
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
  const doc = await PDFDocument.load(options.data, { ignoreEncryption: true });
  try {
    await applyFormValues(doc, options.fields);
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

export function suggestedFillFileName(originalName: string) {
  const base = originalName.replace(/\.pdf$/i, "").trim() || "formulario";
  return `${base}-relleno.pdf`;
}
