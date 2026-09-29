"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Download, Trash2 } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PdfKitSlug } from "@/lib/pdf-kit";
import { newId } from "@/lib/quotes";
import { noticeForSave, type SaveResult } from "@/lib/save-file";
import {
  MAX_IMAGE_FILES,
  MAX_PDF_BYTES,
  MAX_PDF_FILES,
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

function copyFor(kind: Exclude<PdfKitSlug, "sign">) {
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

export function PdfKitTool({ kind }: { kind: Exclude<PdfKitSlug, "sign"> }) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [range, setRange] = useState("");
  const [perPage, setPerPage] = useState(false);
  const [strength, setStrength] = useState<"light" | "strong">("light");

  const multiple = kind === "merge" || kind === "images";
  const wantsPdf = kind !== "images";
  const copy = copyFor(kind);

  async function addFiles(list: File[]) {
    setError("");
    setNotice("");
    const picked = list.filter((file) =>
      wantsPdf ? isPdfFile(file) : isImageFile(file),
    );
    if (picked.length === 0) {
      setError(wantsPdf ? "Sube archivos PDF." : "Sube JPG o PNG.");
      return;
    }
    const next: Item[] = [];
    for (const file of picked) {
      if (file.size > MAX_PDF_BYTES) {
        setError(`${file.name} pesa más de 20 MB.`);
        return;
      }
      let pages: number | null = null;
      if (wantsPdf) {
        try {
          pages = await countPdfPages(await file.arrayBuffer());
        } catch (caught) {
          setError(
            caught instanceof Error ? caught.message : "No se pudo leer el PDF.",
          );
          return;
        }
      }
      next.push({ id: newId(), file, pages });
    }
    setItems((current) => {
      const merged = multiple ? [...current, ...next] : next.slice(0, 1);
      const limit = kind === "images" ? MAX_IMAGE_FILES : MAX_PDF_FILES;
      if (merged.length > limit) {
        setError(`Como máximo ${limit} archivos.`);
        return current;
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
    setBusy(true);
    setError("");
    setNotice("");
    try {
      let result: SaveResult = "saved";
      let ready = "";
      if (kind === "merge") {
        if (items.length < 2) throw new Error("Elige al menos dos PDF.");
        const buffers = await Promise.all(items.map((item) => item.file.arrayBuffer()));
        const bytes = await mergePdfs(buffers);
        result = await downloadBytes(
          bytes,
          suggestedOutName(items[0].file.name, "unido", "pdf"),
          "application/pdf",
        );
        ready = `Listo: ${items.length} archivos, ${formatBytes(bytes.byteLength)}.`;
      } else if (kind === "split") {
        const file = items[0]?.file;
        if (!file) throw new Error("Sube un PDF.");
        const data = await file.arrayBuffer();
        const pageCount = items[0].pages ?? (await countPdfPages(data));
        if (perPage) {
          const files = await splitPdfPerPage(data);
          result = await downloadBytes(
            zipFiles(files),
            suggestedOutName(file.name, "paginas", "zip"),
            "application/zip",
          );
          ready = `Listo: ${files.length} PDF en un zip.`;
        } else {
          const indices = parsePageRanges(range, pageCount);
          const bytes = await extractPdfPages(data, indices);
          result = await downloadBytes(
            bytes,
            suggestedOutName(file.name, "extracto", "pdf"),
            "application/pdf",
          );
          ready = `Listo: ${indices.length} página${indices.length === 1 ? "" : "s"}, ${formatBytes(bytes.byteLength)}.`;
        }
      } else if (kind === "compress") {
        const file = items[0]?.file;
        if (!file) throw new Error("Sube un PDF.");
        const data = await file.arrayBuffer();
        const { bytes, rasterized } = await compressPdf(data, strength);
        result = await downloadBytes(
          bytes,
          suggestedOutName(file.name, "comprimido", "pdf"),
          "application/pdf",
        );
        const before = file.size;
        const after = bytes.byteLength;
        const ratio = after < before ? Math.round((1 - after / before) * 100) : 0;
        ready = rasterized
          ? `Listo: ${formatBytes(before)} → ${formatBytes(after)}. El texto ya no se puede seleccionar (va como foto).`
          : after < before
            ? `Listo: ${formatBytes(before)} → ${formatBytes(after)} (${ratio} % menos).`
            : `Se ha reescrito el PDF (${formatBytes(after)}). Si casi no baja, prueba la compresión fuerte.`;
      } else if (kind === "images") {
        if (items.length === 0) throw new Error("Elige al menos una imagen.");
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
          suggestedOutName(items[0].file.name, "fotos", "pdf"),
          "application/pdf",
        );
        ready = `Listo: ${items.length} imagen${items.length === 1 ? "" : "es"} en un PDF A4.`;
      } else {
        const file = items[0]?.file;
        if (!file) throw new Error("Sube un PDF.");
        const bytes = await pdfToJpegZip(await file.arrayBuffer());
        result = await downloadBytes(
          bytes,
          suggestedOutName(file.name, "jpg", "zip"),
          "application/zip",
        );
        ready = "Listo: un JPG por página, en un zip.";
      }
      setNotice(noticeForSave(result, ready));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo terminar.",
      );
    } finally {
      setBusy(false);
    }
  }

  const actionLabel =
    kind === "merge"
      ? "Unir y guardar"
      : kind === "split"
        ? perPage
          ? "Dividir y guardar zip"
          : "Extraer y guardar"
        : kind === "compress"
          ? "Comprimir y guardar"
          : kind === "images"
            ? "Crear PDF"
            : "Sacar JPG";

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
        hint="No se envía a ningún servidor. Con cuenta, en este navegador."
        busyHint="Un archivo grande tarda un momento."
        onFiles={(list) => void addFiles(list)}
      />

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
                    ? ` · ${item.pages} página${item.pages === 1 ? "" : "s"}`
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
                    aria-label="Subir"
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
                    aria-label="Bajar"
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
                aria-label="Quitar"
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
            Un PDF por cada página (zip)
          </label>
          {perPage ? null : (
            <div className="grid gap-1.5">
              <Label htmlFor="pdf-range">
                Páginas a extraer (en blanco = todas)
              </Label>
              <Input
                id="pdf-range"
                className="h-12"
                value={range}
                onChange={(event) => setRange(event.target.value)}
                placeholder={
                  items[0].pages ? `1-${items[0].pages} o 1-3, 5` : "1-3, 5"
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
            Ligera (mantiene el texto)
          </Button>
          <Button
            type="button"
            className="h-12"
            variant={strength === "strong" ? "default" : "outline"}
            onClick={() => setStrength("strong")}
          >
            Fuerte (páginas como foto)
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
          {busy ? "Preparando…" : <Download />}
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
