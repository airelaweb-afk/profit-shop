"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageKitSlug } from "@/lib/image-kit";
import {
  MAX_IMAGE_FILES,
  downloadBlob,
  exportImage,
  extFor,
  formatBytes,
  isHeicFile,
  isImageFile,
  loadBitmap,
  mimeFor,
  suggestedOutName,
  zipBlobs,
  type CropNorm,
  type OutFormat,
  type Turn,
} from "@/lib/image-ops";
import { newId } from "@/lib/quotes";

type Item = {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  bitmap: ImageBitmap;
};

const acceptAll =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif";

function targetFormat(kind: ImageKitSlug, file: File): OutFormat {
  if (kind === "to-png") return "png";
  if (kind === "to-webp") return "webp";
  if (kind === "to-jpg" || kind === "heic") return "jpeg";
  if (kind === "compress") {
    if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
      return "jpeg";
    }
    if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
      return "webp";
    }
    return "jpeg";
  }
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return "png";
  }
  if (file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp")) {
    return "webp";
  }
  return "jpeg";
}

function dropTitle(kind: ImageKitSlug) {
  if (kind === "heic") return "Suelta las fotos HEIC del iPhone";
  if (kind === "compress") return "Suelta las fotos que pesan demasiado";
  if (kind === "to-jpg") return "Suelta PNG, WebP o HEIC para pasarlos a JPG";
  if (kind === "to-png") return "Suelta JPG o WebP para pasarlos a PNG";
  if (kind === "to-webp") return "Suelta JPG o PNG para pasarlos a WebP";
  if (kind === "resize") return "Suelta la imagen a redimensionar";
  if (kind === "crop") return "Suelta la imagen a recortar";
  return "Suelta la imagen que está de lado";
}

export function ImageKitTool({ kind }: { kind: ImageKitSlug }) {
  const input = useRef<HTMLInputElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [quality, setQuality] = useState(0.72);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [lock, setLock] = useState(true);
  const [turn, setTurn] = useState<Turn>(90);
  const [crop, setCrop] = useState<CropNorm>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const drag = useRef<{
    x: number;
    y: number;
    mode: "new" | "move";
    start: CropNorm;
  } | null>(null);

  useEffect(() => {
    return () => {
      for (const item of items) {
        if (item.preview.startsWith("blob:")) URL.revokeObjectURL(item.preview);
        item.bitmap.close();
      }
    };
    // Only on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(list: File[]) {
    setError("");
    setNotice("");
    let picked = list.filter(isImageFile);
    if (kind === "heic") {
      picked = picked.filter(isHeicFile);
      if (picked.length === 0) {
        setError("Sube un HEIC o HEIF (fotos de iPhone). El resto usa PNG a JPG.");
        return;
      }
    }
    if (picked.length === 0) {
      setError("Sube JPG, PNG, WebP o HEIC.");
      return;
    }
    const next: Item[] = [];
    for (const file of picked) {
      try {
        const bitmap = await loadBitmap(file);
        let preview = URL.createObjectURL(file);
        if (isHeicFile(file)) {
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
          URL.revokeObjectURL(preview);
          preview = canvas.toDataURL("image/jpeg", 0.7);
        }
        next.push({
          id: newId(),
          file,
          preview,
          width: bitmap.width,
          height: bitmap.height,
          bitmap,
        });
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "No se pudo abrir la imagen.",
        );
        return;
      }
    }
    setItems((current) => {
      for (const old of current) {
        if (old.preview.startsWith("blob:")) {
          URL.revokeObjectURL(old.preview);
        }
        old.bitmap.close();
      }
      const merged = [...next];
      if (merged.length > MAX_IMAGE_FILES) {
        setError(`Como máximo ${MAX_IMAGE_FILES} imágenes.`);
        return current;
      }
      const first = merged[0];
      if (first) {
        setWidth(first.width);
        setHeight(first.height);
      }
      return merged;
    });
  }

  function onPointer(event: React.PointerEvent<HTMLDivElement>, moving: boolean) {
    if (kind !== "crop") return;
    const box = stage.current?.getBoundingClientRect();
    if (!box) return;
    const px = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    const py = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
    if (!moving) {
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        x: px,
        y: py,
        mode: "new",
        start: crop,
      };
      return;
    }
    if (!drag.current) return;
    const x = Math.min(drag.current.x, px);
    const y = Math.min(drag.current.y, py);
    setCrop({
      x,
      y,
      w: Math.max(0.04, Math.abs(px - drag.current.x)),
      h: Math.max(0.04, Math.abs(py - drag.current.y)),
    });
  }

  async function run() {
    if (items.length === 0) {
      setError("Elige al menos una imagen.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const outputs: { name: string; bytes: Uint8Array }[] = [];
      let totalIn = 0;
      let totalOut = 0;
      for (const item of items) {
        const format = targetFormat(kind, item.file);
        const blob = await exportImage({
          bitmap: item.bitmap,
          format,
          quality: kind === "compress" ? quality : 0.86,
          maxWidth: kind === "resize" ? width : undefined,
          maxHeight: kind === "resize" ? height : undefined,
          rotate: kind === "rotate" ? turn : 0,
          crop: kind === "crop" ? crop : undefined,
        });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        totalIn += item.file.size;
        totalOut += bytes.byteLength;
        outputs.push({
          name: suggestedOutName(
            item.file.name,
            kind === "compress" ? "ligera" : kind,
            extFor(format),
          ),
          bytes,
        });
      }
      if (outputs.length === 1) {
        const file = outputs[0];
        const copy = new Uint8Array(file.bytes);
        downloadBlob(
          new Blob([copy], { type: mimeFor(targetFormat(kind, items[0].file)) }),
          file.name,
        );
      } else {
        const zipped = zipBlobs(outputs);
        const copy = new Uint8Array(zipped);
        downloadBlob(
          new Blob([copy], { type: "application/zip" }),
          "imagenes-luna-oficio.zip",
        );
      }
      const ratio =
        totalOut < totalIn ? Math.round((1 - totalOut / totalIn) * 100) : 0;
      setNotice(
        kind === "compress"
          ? totalOut < totalIn
            ? `Listo: ${formatBytes(totalIn)} → ${formatBytes(totalOut)} (${ratio} % menos).`
            : `Se ha reescrito (${formatBytes(totalOut)}). Si no baja, es un PNG: pásalo a JPG.`
          : `Listo: ${outputs.length} archivo${outputs.length === 1 ? "" : "s"}.`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo terminar.",
      );
    } finally {
      setBusy(false);
    }
  }

  const first = items[0];
  const action =
    kind === "compress"
      ? "Comprimir y descargar"
      : kind === "crop"
        ? "Recortar y descargar"
        : kind === "resize"
          ? "Redimensionar y descargar"
          : kind === "rotate"
            ? "Girar y descargar"
            : "Convertir y descargar";

  return (
    <div className="mx-auto max-w-2xl">
      <input
        ref={input}
        type="file"
        accept={kind === "heic" ? ".heic,.heif,image/heic,image/heif" : acceptAll}
        multiple={kind !== "crop"}
        className="sr-only"
        onChange={(event) => {
          const list = [...(event.target.files ?? [])];
          event.target.value = "";
          void addFiles(list);
        }}
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
        <p className="mt-4 font-heading text-2xl">{dropTitle(kind)}</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {busy
            ? "Trabajando en este ordenador…"
            : "No se envía a ningún servidor. Quitar fondo, ampliar con IA y PDF a Word siguen aparcados."}
        </p>
        {!busy ? (
          <span className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">
            Elegir del ordenador
          </span>
        ) : null}
      </button>

      {kind === "compress" ? (
        <div className="mt-6 grid gap-2">
          <Label htmlFor="img-quality">
            Calidad JPG/WebP: {Math.round(quality * 100)} %
          </Label>
          <input
            id="img-quality"
            type="range"
            min={40}
            max={92}
            value={Math.round(quality * 100)}
            onChange={(event) => setQuality(Number(event.target.value) / 100)}
          />
          <p className="text-xs text-muted-foreground">
            Un PNG a veces no baja hasta pasarlo a JPG (se pierde la
            transparencia).
          </p>
        </div>
      ) : null}

      {kind === "resize" && first ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="img-w">Ancho (px)</Label>
            <Input
              id="img-w"
              type="number"
              min={16}
              className="h-10"
              value={width}
              onChange={(event) => {
                const next = Number(event.target.value) || 1;
                setWidth(next);
                if (lock) {
                  setHeight(Math.max(1, Math.round((next * first.height) / first.width)));
                }
              }}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="img-h">Alto (px)</Label>
            <Input
              id="img-h"
              type="number"
              min={16}
              className="h-10"
              value={height}
              onChange={(event) => {
                const next = Number(event.target.value) || 1;
                setHeight(next);
                if (lock) {
                  setWidth(Math.max(1, Math.round((next * first.width) / first.height)));
                }
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={lock}
              onChange={(event) => setLock(event.target.checked)}
            />
            Mantener proporción ({first.width}×{first.height})
          </label>
        </div>
      ) : null}

      {kind === "rotate" ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {([90, 180, 270] as Turn[]).map((value) => (
            <Button
              key={value}
              type="button"
              variant={turn === value ? "default" : "outline"}
              onClick={() => setTurn(value)}
            >
              {value}°
            </Button>
          ))}
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-6 grid gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt=""
                className="size-12 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.width}×{item.height} · {formatBytes(item.file.size)}
                </p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label="Quitar"
                onClick={() => {
                  if (item.preview.startsWith("blob:")) {
                    URL.revokeObjectURL(item.preview);
                  }
                  item.bitmap.close();
                  setItems((current) => current.filter((row) => row.id !== item.id));
                }}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {kind === "crop" && first ? (
        <div className="mt-6">
          <p className="mb-2 text-sm text-muted-foreground">
            Arrastra sobre la foto para marcar el recorte.
          </p>
          <div
            ref={stage}
            className="relative inline-block max-w-full cursor-crosshair overflow-hidden rounded-xl ring-1 ring-foreground/10"
            onPointerDown={(event) => onPointer(event, false)}
            onPointerMove={(event) => {
              if (drag.current) onPointer(event, true);
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={first.preview}
              alt="Recortar"
              className="block max-h-[28rem] max-w-full select-none"
              draggable={false}
            />
            <div
              className="pointer-events-none absolute border-2 border-primary bg-primary/10"
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.w * 100}%`,
                height: `${crop.h * 100}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          className="h-11 px-5"
          disabled={busy || items.length === 0}
          onClick={() => void run()}
        >
          {busy ? "Preparando…" : <Download />}
          {busy ? "" : action}
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
