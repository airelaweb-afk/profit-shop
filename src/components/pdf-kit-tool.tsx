"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, FileUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PdfKitSlug } from "@/lib/pdf-kit";
import { newId } from "@/lib/quotes";
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
  if (kind === "images") return "image/jpeg,image/png,.jpg,.jpeg,.png";
  return "application/pdf,.pdf";
}

function titleFor(kind: PdfKitSlug) {
  switch (kind) {
    case "merge":
      return "Suelta los PDF, en el orden que quieras";
    case "split":
      return "Suelta el PDF que quieres partir";
    case "compress":
      return "Suelta el PDF que pesa demasiado";
    case "images":
      return "Suelta fotos o capturas (JPG o PNG)";
    case "to-images":
      return "Suelta el PDF para sacar las páginas en JPG";
    default:
      return "Suelta el archivo";
  }
}

export function PdfKitTool({ kind }: { kind: Exclude<PdfKitSlug, "sign"> }) {
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [range, setRange] = useState("");
  const [perPage, setPerPage] = useState(false);
  const [strength, setStrength] = useState<"light" | "strong">("light");

  const multiple = kind === "merge" || kind === "images";
  const wantsPdf = kind !== "images";

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

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const list = [...(event.target.files ?? [])];
    event.target.value = "";
    void addFiles(list);
  }

  function move(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      const [row] = copy.splice(index, 1);
      copy.splice(target, 0, row);
      return copy;
    });
  }

  async function run() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (kind === "merge") {
        if (items.length < 2) throw new Error("Elige al menos dos PDF.");
        const buffers = await Promise.all(items.map((item) => item.file.arrayBuffer()));
        const bytes = await mergePdfs(buffers);
        downloadBytes(
          bytes,
          suggestedOutName(items[0].file.name, "unido", "pdf"),
          "application/pdf",
        );
        setNotice(
          `Listo: ${items.length} archivos, ${formatBytes(bytes.byteLength)}.`,
        );
      } else if (kind === "split") {
        const file = items[0]?.file;
        if (!file) throw new Error("Sube un PDF.");
        const data = await file.arrayBuffer();
        const pageCount = items[0].pages ?? (await countPdfPages(data));
        if (perPage) {
          const files = await splitPdfPerPage(data);
          downloadBytes(
            zipFiles(files),
            suggestedOutName(file.name, "paginas", "zip"),
            "application/zip",
          );
          setNotice(`Listo: ${files.length} PDF en un zip.`);
        } else {
          const indices = parsePageRanges(range, pageCount);
          const bytes = await extractPdfPages(data, indices);
          downloadBytes(
            bytes,
            suggestedOutName(file.name, "extracto", "pdf"),
            "application/pdf",
          );
          setNotice(
            `Listo: ${indices.length} página${indices.length === 1 ? "" : "s"}, ${formatBytes(bytes.byteLength)}.`,
          );
        }
      } else if (kind === "compress") {
        const file = items[0]?.file;
        if (!file) throw new Error("Sube un PDF.");
        const data = await file.arrayBuffer();
        const { bytes, rasterized } = await compressPdf(data, strength);
        downloadBytes(
          bytes,
          suggestedOutName(file.name, "comprimido", "pdf"),
          "application/pdf",
        );
        const before = file.size;
        const after = bytes.byteLength;
        const ratio = after < before ? Math.round((1 - after / before) * 100) : 0;
        setNotice(
          rasterized
            ? `Listo: ${formatBytes(before)} → ${formatBytes(after)}. El texto ya no se puede seleccionar (va como foto).`
            : after < before
              ? `Listo: ${formatBytes(before)} → ${formatBytes(after)} (${ratio} % menos).`
              : `Se ha reescrito el PDF (${formatBytes(after)}). Si casi no baja, prueba la compresión fuerte.`,
        );
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
        downloadBytes(
          bytes,
          suggestedOutName(items[0].file.name, "fotos", "pdf"),
          "application/pdf",
        );
        setNotice(
          `Listo: ${items.length} imagen${items.length === 1 ? "" : "es"} en un PDF A4.`,
        );
      } else {
        const file = items[0]?.file;
        if (!file) throw new Error("Sube un PDF.");
        const bytes = await pdfToJpegZip(await file.arrayBuffer());
        downloadBytes(
          bytes,
          suggestedOutName(file.name, "jpg", "zip"),
          "application/zip",
        );
        setNotice("Listo: un JPG por página, en un zip.");
      }
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
      ? "Unir y descargar"
      : kind === "split"
        ? perPage
          ? "Dividir y descargar zip"
          : "Extraer y descargar"
        : kind === "compress"
          ? "Comprimir y descargar"
          : kind === "images"
            ? "Crear PDF"
            : "Sacar JPG";

  return (
    <div className="mx-auto max-w-2xl">
      <input
        ref={input}
        type="file"
        accept={acceptFor(kind)}
        multiple={multiple}
        className="sr-only"
        onChange={onFile}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles([...event.dataTransfer.files]);
        }}
        className={`flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-foreground/20 bg-card hover:border-primary/50 hover:bg-muted/40"
        }`}
      >
        <FileUp className="size-10 text-primary" />
        <p className="mt-4 font-heading text-2xl">{titleFor(kind)}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {busy
            ? "Trabajando en este ordenador. Un archivo grande tarda un momento."
            : "No se envía a ningún servidor. Con cuenta, en este navegador."}
        </p>
        {!busy ? (
          <span className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">
            Elegir del ordenador
          </span>
        ) : null}
      </button>

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
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Subir"
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
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
                size="icon-sm"
                variant="ghost"
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
          <label className="flex items-center gap-2 text-sm">
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
                className="h-10"
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
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            type="button"
            variant={strength === "light" ? "default" : "outline"}
            onClick={() => setStrength("light")}
          >
            Ligera (mantiene el texto)
          </Button>
          <Button
            type="button"
            variant={strength === "strong" ? "default" : "outline"}
            onClick={() => setStrength("strong")}
          >
            Fuerte (páginas como foto)
          </Button>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          type="button"
          size="lg"
          className="h-11 px-5"
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
