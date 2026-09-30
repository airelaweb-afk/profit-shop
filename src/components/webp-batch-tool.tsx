"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Trash2 } from "lucide-react";
import { zipSync } from "fflate";
import { FileDrop } from "@/components/file-drop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_IMAGE_BYTES,
  downloadBlob,
  exportImage,
  formatBytes,
  isImageFile,
  loadBitmap,
} from "@/lib/image-ops";
import { noticeForSave } from "@/lib/save-file";

export const MAX_BATCH_FILES = 300;

type Queued = { id: string; file: File; path: string };

type Result = {
  path: string;
  outPath: string;
  inBytes: number;
  outBytes: number;
  status: "ok" | "kept" | "error";
  detail?: string;
};

const WIDTH_PRESETS = [
  { label: "Original", value: 0 },
  { label: "1200 px", value: 1200 },
  { label: "1600 px", value: 1600 },
  { label: "1920 px", value: 1920 },
];

const acceptImages =
  "image/*,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif";

function relativePath(file: File) {
  const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  return rel && rel.length > 0 ? rel : file.name;
}

function webpName(path: string) {
  return path.replace(/\.[^./]+$/, "") + ".webp";
}

function yieldToBrowser() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export function WebpBatchTool() {
  const [queue, setQueue] = useState<Queued[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [customWidth, setCustomWidth] = useState("");
  const [keepIfBigger, setKeepIfBigger] = useState(true);
  const [keepFolders, setKeepFolders] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [results, setResults] = useState<Result[]>([]);
  const [zip, setZip] = useState<{ blob: Blob; name: string } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const cancelled = useRef(false);

  useEffect(() => {
    return () => {
      cancelled.current = true;
    };
  }, []);

  function addFiles(list: File[]) {
    setError("");
    setNotice("");
    setResults([]);
    setZip(null);
    const picked = list.filter(isImageFile);
    if (picked.length === 0) {
      setError("No hay imágenes en lo que has elegido. Valen JPG, PNG, WebP, GIF y HEIC.");
      return;
    }
    const tooBig = picked.filter((file) => file.size > MAX_IMAGE_BYTES);
    if (tooBig.length > 0) {
      setError(
        `${tooBig.length} archivo${tooBig.length === 1 ? "" : "s"} pasan de 40 MB y se han dejado fuera (${tooBig
          .slice(0, 3)
          .map((file) => file.name)
          .join(", ")}${tooBig.length > 3 ? "…" : ""}).`,
      );
    }
    setQueue((current) => {
      const seen = new Set(current.map((item) => item.path));
      const next = [...current];
      for (const file of picked) {
        if (file.size > MAX_IMAGE_BYTES) continue;
        const path = relativePath(file);
        if (seen.has(path)) continue;
        seen.add(path);
        next.push({ id: `${path}-${file.size}-${file.lastModified}`, file, path });
      }
      if (next.length > MAX_BATCH_FILES) {
        setError(`Como máximo ${MAX_BATCH_FILES} imágenes por tanda. Se han cogido las primeras.`);
        return next.slice(0, MAX_BATCH_FILES);
      }
      return next;
    });
  }

  async function run() {
    if (queue.length === 0) {
      setError("Elige imágenes o una carpeta.");
      return;
    }
    const width = customWidth.trim() ? Number(customWidth) : maxWidth;
    if (customWidth.trim() && (!Number.isFinite(width) || width < 16)) {
      setError("El ancho máximo tiene que ser un número de píxeles (mínimo 16).");
      return;
    }
    cancelled.current = false;
    setBusy(true);
    setError("");
    setNotice("");
    setZip(null);
    setResults([]);
    setProgress({ done: 0, total: queue.length, current: "" });

    const out: Result[] = [];
    const entries: Record<string, [Uint8Array, { level: 0 }]> = {};
    const usedNames = new Set<string>();

    function uniqueName(name: string) {
      let candidate = name;
      let index = 2;
      while (usedNames.has(candidate)) {
        candidate = name.replace(/(\.[^./]+)$/, `-${index}$1`);
        index += 1;
      }
      usedNames.add(candidate);
      return candidate;
    }

    try {
      for (const item of queue) {
        if (cancelled.current) break;
        setProgress({ done: out.length, total: queue.length, current: item.path });
        const basePath = keepFolders ? item.path : item.file.name;
        let bitmap: ImageBitmap | null = null;
        try {
          bitmap = await loadBitmap(item.file);
          const blob = await exportImage({
            bitmap,
            format: "webp",
            quality: quality / 100,
            maxWidth: width > 0 ? width : undefined,
          });
          const bytes = new Uint8Array(await blob.arrayBuffer());
          if (keepIfBigger && bytes.byteLength >= item.file.size) {
            const original = new Uint8Array(await item.file.arrayBuffer());
            const name = uniqueName(basePath);
            entries[name] = [original, { level: 0 }];
            out.push({
              path: item.path,
              outPath: name,
              inBytes: item.file.size,
              outBytes: item.file.size,
              status: "kept",
              detail: "El WebP pesaba más: se conserva el original.",
            });
          } else {
            const name = uniqueName(webpName(basePath));
            entries[name] = [bytes, { level: 0 }];
            out.push({
              path: item.path,
              outPath: name,
              inBytes: item.file.size,
              outBytes: bytes.byteLength,
              status: "ok",
            });
          }
        } catch (caught) {
          out.push({
            path: item.path,
            outPath: "",
            inBytes: item.file.size,
            outBytes: 0,
            status: "error",
            detail: caught instanceof Error ? caught.message : "No se pudo convertir.",
          });
        } finally {
          bitmap?.close();
        }
        setResults([...out]);
        await yieldToBrowser();
      }

      const converted = out.filter((row) => row.status !== "error");
      if (converted.length === 0) {
        throw new Error("No se ha podido convertir ninguna imagen.");
      }
      const zipped = zipSync(entries);
      const copy = new Uint8Array(zipped);
      const blob = new Blob([copy], { type: "application/zip" });
      const name = `webp-luna-oficio-${new Date().toISOString().slice(0, 10)}.zip`;
      setZip({ blob, name });
      const totalIn = converted.reduce((sum, row) => sum + row.inBytes, 0);
      const totalOut = converted.reduce((sum, row) => sum + row.outBytes, 0);
      const ratio = totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
      const result = await downloadBlob(blob, name);
      setNotice(
        noticeForSave(
          result,
          `Listo: ${converted.length} ${converted.length === 1 ? "imagen" : "imágenes"}, ${formatBytes(totalIn)} → ${formatBytes(totalOut)} (${ratio} % menos).`,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo terminar.");
    } finally {
      setBusy(false);
      setProgress((current) => ({ ...current, current: "" }));
    }
  }

  const totalQueued = queue.reduce((sum, item) => sum + item.file.size, 0);
  const okCount = results.filter((row) => row.status === "ok").length;
  const keptCount = results.filter((row) => row.status === "kept").length;
  const errorCount = results.filter((row) => row.status === "error").length;

  return (
    <div className="mx-auto max-w-3xl">
      <FileDrop
        accept={acceptImages}
        multiple
        busy={busy}
        dropTitle="Suelta las imágenes o la carpeta entera"
        tapTitle="Elige las imágenes a convertir"
        cta="Elegir imágenes"
        folderCta="Elegir una carpeta"
        hint={`Hasta ${MAX_BATCH_FILES} imágenes por tanda (JPG, PNG, WebP, GIF, HEIC). Se convierten una a una en este navegador y bajan en un zip.`}
        busyHint="Convirtiendo. Puedes seguir mirando la lista mientras avanza."
        onFiles={addFiles}
      />

      <div className="mt-6 grid gap-5 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="grid gap-2">
          <Label htmlFor="wb-quality">Calidad WebP: {quality}</Label>
          <input
            id="wb-quality"
            type="range"
            min={50}
            max={95}
            value={quality}
            disabled={busy}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            80 es el punto habitual para una web: apenas se nota y pesa mucho
            menos. Para fotografía de producto, 85-90.
          </p>
        </div>

        <div className="grid gap-2">
          <p className="text-sm font-medium">Ancho máximo</p>
          <div className="flex flex-wrap gap-2">
            {WIDTH_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={!customWidth && maxWidth === preset.value ? "default" : "outline"}
                className="h-11"
                disabled={busy}
                onClick={() => {
                  setMaxWidth(preset.value);
                  setCustomWidth("");
                }}
              >
                {preset.label}
              </Button>
            ))}
            <Input
              aria-label="Ancho máximo personalizado en píxeles"
              className="h-11 w-32"
              inputMode="numeric"
              placeholder="Otro (px)"
              value={customWidth}
              disabled={busy}
              onChange={(event) => setCustomWidth(event.target.value.replace(/[^\d]/g, ""))}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Las imágenes más pequeñas no se amplían. Se mantiene la proporción.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={keepIfBigger}
              disabled={busy}
              onChange={(event) => setKeepIfBigger(event.target.checked)}
            />
            <span>
              Si el WebP pesa más, conservar el original
              <span className="block text-xs text-muted-foreground">
                Evita empeorar PNG muy simples o iconos.
              </span>
            </span>
          </label>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={keepFolders}
              disabled={busy}
              onChange={(event) => setKeepFolders(event.target.checked)}
            />
            <span>
              Mantener las subcarpetas en el zip
              <span className="block text-xs text-muted-foreground">
                Útil para sustituir la carpeta de la web tal cual.
              </span>
            </span>
          </label>
        </div>
      </div>

      {queue.length > 0 ? (
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <strong>{queue.length}</strong> {queue.length === 1 ? "imagen" : "imágenes"} en cola ·{" "}
              {formatBytes(totalQueued)}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              disabled={busy}
              onClick={() => {
                setQueue([]);
                setResults([]);
                setZip(null);
                setNotice("");
              }}
            >
              <Trash2 />
              Vaciar la cola
            </Button>
          </div>
          {results.length === 0 ? (
            <ul className="mt-3 max-h-64 overflow-auto rounded-xl bg-card ring-1 ring-foreground/10">
              {queue.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-foreground/5 px-3 py-2 text-sm last:border-b-0"
                >
                  <span className="truncate">{item.path}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatBytes(item.file.size)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full px-5 sm:w-auto"
          disabled={busy || queue.length === 0}
          onClick={() => void run()}
        >
          {busy ? (
            `Convirtiendo ${progress.done + 1} de ${progress.total}…`
          ) : (
            <>
              <Download />
              Convertir a WebP y bajar el zip
            </>
          )}
        </Button>
        {busy ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 w-full sm:w-auto"
            onClick={() => {
              cancelled.current = true;
            }}
          >
            Parar aquí y bajar lo hecho
          </Button>
        ) : null}
        {zip && !busy ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12 w-full sm:w-auto"
            onClick={() => void downloadBlob(zip.blob, zip.name)}
          >
            <RotateCcw />
            Descargar el zip otra vez
          </Button>
        ) : null}
      </div>

      {busy ? (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-2 truncate text-xs text-muted-foreground">{progress.current}</p>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{notice}</p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm">
            <strong>{okCount}</strong> convertida{okCount === 1 ? "" : "s"}
            {keptCount > 0 ? ` · ${keptCount} sin tocar (pesaban menos)` : ""}
            {errorCount > 0 ? ` · ${errorCount} con error` : ""}
          </p>
          <ul className="mt-3 max-h-80 overflow-auto rounded-xl bg-card ring-1 ring-foreground/10">
            {results.map((row) => {
              const saved =
                row.inBytes > 0 && row.outBytes < row.inBytes
                  ? Math.round((1 - row.outBytes / row.inBytes) * 100)
                  : 0;
              return (
                <li
                  key={row.path}
                  className="grid gap-1 border-b border-foreground/5 px-3 py-2 text-sm last:border-b-0 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <span className="truncate">{row.outPath || row.path}</span>
                  <span
                    className={`text-xs ${
                      row.status === "error" ? "text-destructive" : "text-muted-foreground"
                    }`}
                  >
                    {row.status === "ok"
                      ? `${formatBytes(row.inBytes)} → ${formatBytes(row.outBytes)} · −${saved} %`
                      : row.detail}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
