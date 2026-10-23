"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Download, Trash2 } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PdfKitSlug } from "@/lib/pdf-kit";
import { bytesLabel } from "@/lib/limits";
import { newId } from "@/lib/quotes";
import { noticeForSave, type SaveResult } from "@/lib/save-file";
import {
  compressPdf,
  countPdfPages,
  downloadBytes,
  extractPdfPages,
  formatBytes,
  imagesToPdf,
  isImageFile,
  isPdfFile,
  mergePdfs,
  parsePageRanges,
  pdfToJpegZip,
  splitPdfPerPage,
  suggestedOutName,
  zipFiles,
} from "@/lib/pdf-ops";

type Item = {
  id: string;
  file: File;
  pages: number | null;
};

function acceptFor(kind: PdfKitSlug) {
  if (kind === "images") return "image/*,image/jpeg,image/png,.jpg,.jpeg,.png";
  return "application/pdf,.pdf";
}

function copyFor(kind: Exclude<PdfKitSlug, "sign" | "fill" | "edit">) {
  switch (kind) {
    case "merge":
      return {
        drop: "Suelta los PDF, en el orden que quieras",
        tap: "Elige los PDF, en el orden que quieras",
        cta: "Elegir PDF",
      };
    case "split":
      return {
        drop: "Suelta el PDF que quieres partir",
        tap: "Elige el PDF que quieres partir",
        cta: "Elegir PDF",
      };
    case "compress":
      return {
        drop: "Suelta el PDF que pesa demasiado",
        tap: "Elige el PDF que pesa demasiado",
        cta: "Elegir PDF",
      };
    case "images":
      return {
        drop: "Suelta fotos o capturas (JPG o PNG)",
        tap: "Elige fotos o capturas",
        cta: "Elegir fotos",
        camera: "Hacer foto ahora",
      };
    case "to-images":
      return {
        drop: "Suelta el PDF para sacar las páginas en JPG",
        tap: "Elige el PDF para sacar las páginas en JPG",
        cta: "Elegir PDF",
      };
    default:
      return {
        drop: "Suelta el archivo",
        tap: "Elige el archivo",
        cta: "Elegir archivo",
      };
  }
}

export function PdfKitTool({
  kind,
  locale = "es",
}: {
  kind: Exclude<PdfKitSlug, "sign" | "fill" | "edit">;
  locale?: "es" | "en";
}) {
  const en = locale === "en";
  const tr = (es: string, english: string) => (en ? english : es);
  const { pro, limit, upgrade, setUpgrade, beforeRun, afterRun } = useJobGuard(locale);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [range, setRange] = useState("");
  const [perPage, setPerPage] = useState(false);
  const [strength, setStrength] = useState<"light" | "strong">("light");

  const multiple = kind === "merge" || kind === "images";
  const wantsPdf = kind !== "images";
  const spanishCopy = copyFor(kind);
  const englishCopy = {
    merge: {
      drop: "Drop the PDFs, in the order you want",
      tap: "Choose the PDFs, in the order you want",
      cta: "Choose PDFs",
    },
    split: {
      drop: "Drop the PDF you want to split",
      tap: "Choose the PDF you want to split",
      cta: "Choose PDF",
    },
    compress: {
      drop: "Drop the PDF that is too large",
      tap: "Choose the PDF that is too large",
      cta: "Choose PDF",
    },
    images: {
      drop: "Drop photos or screenshots (JPG or PNG)",
      tap: "Choose photos or screenshots",
      cta: "Choose photos",
      camera: "Take a photo",
    },
    "to-images": {
      drop: "Drop the PDF to save each page as a JPG",
      tap: "Choose the PDF to save each page as a JPG",
      cta: "Choose PDF",
    },
  } as const;
  const copy = en ? englishCopy[kind] : spanishCopy;

  async function addFiles(list: File[]) {
    setError("");
    setNotice("");
    const picked = list.filter((file) =>
      wantsPdf ? isPdfFile(file) : isImageFile(file),
    );
    if (picked.length === 0) {
      setError(
        wantsPdf
          ? tr("Sube archivos PDF.", "Upload PDF files.")
          : tr("Sube JPG o PNG.", "Upload a JPG or PNG."),
      );
      return;
    }
    const maxBytes = limit.pdfBytes;
    const next: Item[] = [];
    for (const file of picked) {
      if (file.size > maxBytes) {
        if (pro) {
          setError(
            en
              ? `${file.name} is larger than ${bytesLabel(maxBytes)}.`
              : `${file.name} pesa más de ${bytesLabel(maxBytes)}.`,
          );
        } else {
          setUpgrade(
            en
              ? `${file.name} is larger than ${bytesLabel(maxBytes)}. Pro accepts larger files.`
              : `${file.name} pesa más de ${bytesLabel(maxBytes)}. En Pro caben archivos más grandes.`,
          );
        }
        return;
      }
      let pages: number | null = null;
      if (wantsPdf) {
        try {
          pages = await countPdfPages(await file.arrayBuffer());
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : tr("No se pudo leer el PDF.", "Could not read the PDF."),
          );
          return;
        }
      }
      next.push({ id: newId(), file, pages });
    }
    setItems((current) => {
      const merged = multiple ? [...current, ...next] : next.slice(0, 1);
      const cap =
        kind === "images"
          ? limit.imagesToPdf
          : kind === "merge"
            ? limit.pdfFiles
            : 1;
      if (merged.length > cap) {
        setUpgrade(
          pro
            ? tr(`Como máximo ${cap} archivos.`, `At most ${cap} files.`)
            : en
              ? `The free plan allows ${cap} ${kind === "images" ? "images" : "PDFs"}. Pro has no limit.`
              : `Gratis son ${cap} ${kind === "images" ? "imágenes" : "PDF"}. Pro es ilimitado.`,
        );
        return merged.slice(0, cap);
      }
      return merged;
    });
  }

  function move(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copyItems = [...current];
      const [row] = copyItems.splice(index, 1);
      copyItems.splice(target, 0, row);
      return copyItems;
    });
  }

  async function run() {
    if (!beforeRun()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let result: SaveResult = "saved";
      let ready = "";
      if (kind === "merge") {
        if (items.length < 2) {
          throw new Error(tr("Elige al menos dos PDF.", "Choose at least two PDFs."));
        }
        const buffers = await Promise.all(items.map((item) => item.file.arrayBuffer()));
        const bytes = await mergePdfs(buffers);
        result = await downloadBytes(
          bytes,
          suggestedOutName(items[0].file.name, en ? "merged" : "unido", "pdf"),
          "application/pdf",
        );
        ready = en
          ? `Done: ${items.length} files, ${formatBytes(bytes.byteLength)}.`
          : `Listo: ${items.length} archivos, ${formatBytes(bytes.byteLength)}.`;
      } else if (kind === "split") {
        const file = items[0]?.file;
        if (!file) throw new Error(tr("Sube un PDF.", "Upload a PDF."));
        const data = await file.arrayBuffer();
        const pageCount = items[0].pages ?? (await countPdfPages(data));
        if (pageCount > limit.pdfPages) {
          throw new Error(
            pro
              ? en
                ? `This PDF has ${pageCount} pages (maximum ${limit.pdfPages}).`
                : `Este PDF tiene ${pageCount} páginas (máximo ${limit.pdfPages}).`
              : en
                ? `Free covers ${limit.pdfPages} pages. This one has ${pageCount}. Pro has no page cap.`
                : `Gratis son ${limit.pdfPages} páginas. Este tiene ${pageCount}. Pro es ilimitado.`,
          );
        }
        if (perPage) {
          const files = await splitPdfPerPage(data);
          result = await downloadBytes(
            zipFiles(files),
            suggestedOutName(file.name, en ? "pages" : "paginas", "zip"),
            "application/zip",
          );
          ready = en
            ? `Done: ${files.length} PDFs in a zip.`
            : `Listo: ${files.length} PDF en un zip.`;
        } else {
          const indices = parsePageRanges(range, pageCount);
          const bytes = await extractPdfPages(data, indices);
          result = await downloadBytes(
            bytes,
            suggestedOutName(file.name, en ? "extract" : "extracto", "pdf"),
            "application/pdf",
          );
          ready = en
            ? `Done: ${indices.length} page${indices.length === 1 ? "" : "s"}, ${formatBytes(bytes.byteLength)}.`
            : `Listo: ${indices.length} página${indices.length === 1 ? "" : "s"}, ${formatBytes(bytes.byteLength)}.`;
        }
      } else if (kind === "compress") {
        const file = items[0]?.file;
        if (!file) throw new Error(tr("Sube un PDF.", "Upload a PDF."));
        const data = await file.arrayBuffer();
        const { bytes, rasterized } = await compressPdf(data, strength);
        result = await downloadBytes(
          bytes,
          suggestedOutName(file.name, en ? "compressed" : "comprimido", "pdf"),
          "application/pdf",
        );
        const before = file.size;
        const after = bytes.byteLength;
        const ratio = after < before ? Math.round((1 - after / before) * 100) : 0;
        ready = rasterized
          ? en
            ? `Done: ${formatBytes(before)} → ${formatBytes(after)}. The text can no longer be selected (each page is a photo).`
            : `Listo: ${formatBytes(before)} → ${formatBytes(after)}. El texto ya no se puede seleccionar (va como foto).`
          : after < before
            ? en
              ? `Done: ${formatBytes(before)} → ${formatBytes(after)} (${ratio}% smaller).`
              : `Listo: ${formatBytes(before)} → ${formatBytes(after)} (${ratio} % menos).`
            : en
              ? `The PDF was rewritten (${formatBytes(after)}). If it barely shrank, try Strong.`
              : `Se ha reescrito el PDF (${formatBytes(after)}). Si casi no baja, prueba la compresión fuerte.`;
      } else if (kind === "images") {
        if (items.length === 0) throw new Error(tr("Elige al menos una imagen.", "Choose at least one image."));
        const images = await Promise.all(
          items.map(async (item) => {
            const name = item.file.name.toLowerCase();
            const png =
              item.file.type === "image/png" || name.endsWith(".png");
            return {
              bytes: await item.file.arrayBuffer(),
              kind: (png ? "png" : "jpg") as "png" | "jpg",
            };
          }),
        );
        const bytes = await imagesToPdf(images);
        result = await downloadBytes(
          bytes,
          suggestedOutName(items[0].file.name, en ? "photos" : "fotos", "pdf"),
          "application/pdf",
        );
        ready = en
          ? `Done: ${items.length} image${items.length === 1 ? "" : "s"} in an A4 PDF.`
          : `Listo: ${items.length} imagen${items.length === 1 ? "" : "es"} en un PDF A4.`;
      } else {
        const file = items[0]?.file;
        if (!file) throw new Error(tr("Sube un PDF.", "Upload a PDF."));
        const bytes = await pdfToJpegZip(await file.arrayBuffer());
        result = await downloadBytes(
          bytes,
          suggestedOutName(file.name, "jpg", "zip"),
          "application/zip",
        );
        ready = en
          ? "Done: one JPG per page, in a zip."
          : "Listo: un JPG por página, en un zip.";
      }
      setNotice(noticeForSave(result, ready, locale));
      afterRun();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : tr("No se pudo terminar.", "Could not finish."),
      );
    } finally {
      setBusy(false);
    }
  }

  const actionLabel =
    kind === "merge"
      ? tr("Unir y guardar", "Merge and save")
      : kind === "split"
        ? perPage
          ? tr("Dividir y guardar zip", "Split and save zip")
          : tr("Extraer y guardar", "Extract and save")
        : kind === "compress"
          ? tr("Comprimir y guardar", "Compress and save")
          : kind === "images"
            ? tr("Crear PDF", "Create PDF")
            : tr("Sacar JPG", "Save JPGs");

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept={acceptFor(kind)}
        multiple={multiple}
        busy={busy}
        dropTitle={copy.drop}
        tapTitle={copy.tap}
        cta={copy.cta}
        cameraCta={"camera" in copy ? copy.camera : undefined}
        hint={tr("No se envía a ningún servidor. Sin cuenta.", "Nothing is uploaded. No account needed.")}
        busyHint={tr("Un archivo grande tarda un momento.", "A large file takes a moment.")}
        busyTitle={en ? "Opening…" : undefined}
        onFiles={(list) => void addFiles(list)}
      />
      <FreeCapNote
        locale={locale}
        text={
          kind === "merge"
            ? en
              ? `Free: up to ${limit.pdfFiles} PDFs of ${bytesLabel(limit.pdfBytes)} and ${limit.jobsPerDay} tasks a day`
              : `Gratis: hasta ${limit.pdfFiles} PDF de ${bytesLabel(limit.pdfBytes)} y ${limit.jobsPerDay} tareas al día`
            : kind === "images"
              ? en
                ? `Free: up to ${limit.imagesToPdf} photos of ${bytesLabel(limit.pdfBytes)}`
                : `Gratis: hasta ${limit.imagesToPdf} fotos de ${bytesLabel(limit.pdfBytes)}`
              : en
                ? `Free: one PDF of ${bytesLabel(limit.pdfBytes)} and ${limit.jobsPerDay} tasks a day`
                : `Gratis: un PDF de ${bytesLabel(limit.pdfBytes)} y ${limit.jobsPerDay} tareas al día`
        }
      />
      {upgrade ? <UpgradeNudge reason={upgrade} compact locale={locale} /> : null}

      {items.length > 0 ? (
        <ul className="mt-6 grid gap-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10"
            >
              <span className="w-6 text-xs text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(item.file.size)}
                  {item.pages
                    ? en
                      ? ` · ${item.pages} page${item.pages === 1 ? "" : "s"}`
                      : ` · ${item.pages} página${item.pages === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
              {multiple ? (
                <>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-11"
                    aria-label={tr("Subir", "Move up")}
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-11"
                    aria-label={tr("Bajar", "Move down")}
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-11"
                aria-label={tr("Quitar", "Remove")}
                onClick={() =>
                  setItems((current) => current.filter((row) => row.id !== item.id))
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {kind === "split" && items[0] ? (
        <div className="mt-6 grid gap-3 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <label className="flex min-h-12 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={perPage}
              onChange={(event) => setPerPage(event.target.checked)}
            />
            {tr("Un PDF por cada página (zip)", "One PDF per page (zip)")}
          </label>
          {perPage ? null : (
            <div className="grid gap-1.5">
              <Label htmlFor="pdf-range">
                {tr("Páginas a extraer (en blanco = todas)", "Pages to extract (blank = all)")}
              </Label>
              <Input
                id="pdf-range"
                className="h-12"
                value={range}
                onChange={(event) => setRange(event.target.value)}
                placeholder={
                  items[0].pages
                    ? en
                      ? `1-${items[0].pages} or 1-3, 5`
                      : `1-${items[0].pages} o 1-3, 5`
                    : "1-3, 5"
                }
              />
            </div>
          )}
        </div>
      ) : null}

      {kind === "compress" ? (
        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
          <Button
            type="button"
            className="h-12"
            variant={strength === "light" ? "default" : "outline"}
            onClick={() => setStrength("light")}
          >
            {tr("Ligera (mantiene el texto)", "Light (keeps the text)")}
          </Button>
          <Button
            type="button"
            className="h-12"
            variant={strength === "strong" ? "default" : "outline"}
            onClick={() => setStrength("strong")}
          >
            {tr("Fuerte (páginas como foto)", "Strong (pages become photos)")}
          </Button>
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full px-5 sm:w-auto"
          disabled={busy || items.length === 0}
          onClick={() => void run()}
        >
          {busy ? tr("Preparando…", "Preparing…") : <Download />}
          {busy ? "" : actionLabel}
        </Button>
      </div>
      {error ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
