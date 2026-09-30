"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PdfExtraSlug } from "@/lib/pdf-kit";
import { newId } from "@/lib/quotes";
import { noticeForSave, type SaveResult } from "@/lib/save-file";
import {
  MAX_PDF_BYTES,
  countPdfPages,
  downloadBytes,
  formatBytes,
  isPdfFile,
  numberPdfPages,
  removePdfPages,
  rotatePdf,
  suggestedOutName,
  watermarkPdf,
} from "@/lib/pdf-ops";

type Item = { id: string; file: File; pages: number | null };

const copy: Record<
  PdfExtraSlug,
  { drop: string; tap: string; cta: string; action: string }
> = {
  rotate: {
    drop: "Suelta el PDF que quieres girar",
    tap: "Elige el PDF que quieres girar",
    cta: "Elegir PDF",
    action: "Rotar y guardar",
  },
  numbers: {
    drop: "Suelta el PDF para numerar las páginas",
    tap: "Elige el PDF para numerar las páginas",
    cta: "Elegir PDF",
    action: "Numerar y guardar",
  },
  watermark: {
    drop: "Suelta el PDF para la marca de agua",
    tap: "Elige el PDF para la marca de agua",
    cta: "Elegir PDF",
    action: "Poner marca y guardar",
  },
  remove: {
    drop: "Suelta el PDF del que quieres quitar páginas",
    tap: "Elige el PDF del que quieres quitar páginas",
    cta: "Elegir PDF",
    action: "Quitar páginas y guardar",
  },
};

export function PdfExtraTool({ kind }: { kind: PdfExtraSlug }) {
  const [item, setItem] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [start, setStart] = useState("1");
  const [mark, setMark] = useState("BORRADOR");
  const [pages, setPages] = useState("");
  const labels = copy[kind];

  async function addFiles(list: File[]) {
    setError("");
    setNotice("");
    const file = list.find((entry) => isPdfFile(entry));
    if (!file) {
      setError("Sube un archivo PDF.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError(`${file.name} pesa más de 20 MB.`);
      return;
    }
    try {
      const pages = await countPdfPages(await file.arrayBuffer());
      setItem({ id: newId(), file, pages });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo leer el PDF.");
    }
  }

  async function run() {
    if (!item) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await item.file.arrayBuffer();
      let bytes: Uint8Array;
      let suffix = "editado";
      let ready = "";
      if (kind === "remove") {
        const removed = await removePdfPages(data, pages);
        bytes = removed.bytes;
        suffix = "sin-paginas";
        ready = `Listo: ${removed.removed} página${removed.removed === 1 ? "" : "s"} fuera, quedan ${removed.kept}. ${formatBytes(bytes.byteLength)}.`;
      } else if (kind === "rotate") {
        bytes = await rotatePdf(data, angle);
        suffix = `rotado-${angle}`;
      } else if (kind === "numbers") {
        const from = Number(start);
        if (!Number.isFinite(from) || from < 1) {
          throw new Error("El número de arranque tiene que ser 1 o más.");
        }
        bytes = await numberPdfPages(data, from);
        suffix = "numerado";
      } else {
        bytes = await watermarkPdf(data, mark);
        suffix = "marca";
      }
      const result: SaveResult = await downloadBytes(
        bytes,
        suggestedOutName(item.file.name, suffix, "pdf"),
        "application/pdf",
      );
      setNotice(noticeForSave(result, ready || `Listo: ${formatBytes(bytes.byteLength)}.`));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo terminar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        dropTitle={labels.drop}
        tapTitle={labels.tap}
        cta={labels.cta}
        hint="No se envía a ningún servidor. Con cuenta, en este navegador."
        busyHint="Un archivo grande tarda un momento."
        onFiles={(list) => void addFiles(list)}
      />

      {item ? (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{item.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(item.file.size)}
              {item.pages
                ? ` · ${item.pages} página${item.pages === 1 ? "" : "s"}`
                : ""}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-11"
            aria-label="Quitar"
            onClick={() => setItem(null)}
          >
            <Trash2 />
          </Button>
        </div>
      ) : null}

      {kind === "rotate" ? (
        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
          {([90, 180, 270] as const).map((value) => (
            <Button
              key={value}
              type="button"
              className="h-12"
              variant={angle === value ? "default" : "outline"}
              onClick={() => setAngle(value)}
            >
              {value}°
            </Button>
          ))}
        </div>
      ) : null}

      {kind === "numbers" ? (
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="pdf-start">Empezar a numerar en</Label>
          <Input
            id="pdf-start"
            className="h-12"
            inputMode="numeric"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>
      ) : null}

      {kind === "remove" ? (
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="pdf-remove">Páginas a quitar</Label>
          <Input
            id="pdf-remove"
            className="h-12"
            inputMode="numeric"
            value={pages}
            onChange={(event) => setPages(event.target.value)}
            placeholder={item?.pages ? `Por ejemplo: 1, 4-6 (hay ${item.pages})` : "Por ejemplo: 1, 4-6"}
          />
          <p className="text-xs text-muted-foreground">
            Números y rangos separados por comas. Las demás páginas se quedan en su orden.
          </p>
        </div>
      ) : null}

      {kind === "watermark" ? (
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="pdf-mark">Texto de la marca</Label>
          <Input
            id="pdf-mark"
            className="h-12"
            value={mark}
            onChange={(event) => setMark(event.target.value)}
            maxLength={72}
            placeholder="BORRADOR"
          />
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full px-5 sm:w-auto"
          disabled={busy || !item || (kind === "remove" && !pages.trim())}
          onClick={() => void run()}
        >
          {busy ? "Preparando…" : <Download />}
          {busy ? "" : labels.action}
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
