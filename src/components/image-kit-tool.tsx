"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageKitSlug } from "@/lib/image-kit";
import { bytesLabel } from "@/lib/limits";
import {
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
import { noticeForSave } from "@/lib/save-file";

type Item = {
  id: string;
  file: File;
  preview: string;
  width: number;
  height: number;
  bitmap: ImageBitmap;
};

const acceptAll =
  "image/*,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif,.gif";

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

function titles(kind: ImageKitSlug) {
  if (kind === "heic") {
    return {
      drop: "Suelta las fotos HEIC del iPhone",
      tap: "Elige las fotos HEIC del carrete",
      cta: "Elegir fotos",
    };
  }
  if (kind === "compress") {
    return {
      drop: "Suelta las fotos que pesan demasiado",
      tap: "Elige las fotos que pesan demasiado",
      cta: "Elegir fotos",
    };
  }
  if (kind === "to-jpg") {
    return {
      drop: "Suelta PNG, WebP o HEIC para pasarlos a JPG",
      tap: "Elige PNG, WebP o HEIC para pasarlos a JPG",
      cta: "Elegir fotos",
    };
  }
  if (kind === "to-png") {
    return {
      drop: "Suelta JPG o WebP para pasarlos a PNG",
      tap: "Elige JPG o WebP para pasarlos a PNG",
      cta: "Elegir fotos",
    };
  }
  if (kind === "to-webp") {
    return {
      drop: "Suelta JPG o PNG para pasarlos a WebP",
      tap: "Elige JPG o PNG para pasarlos a WebP",
      cta: "Elegir fotos",
    };
  }
  if (kind === "resize") {
    return {
      drop: "Suelta la imagen a redimensionar",
      tap: "Elige la imagen a redimensionar",
      cta: "Elegir foto",
    };
  }
  if (kind === "crop") {
    return {
      drop: "Suelta la imagen a recortar",
      tap: "Elige la imagen a recortar",
      cta: "Elegir foto",
    };
  }
  return {
    drop: "Suelta la imagen que está de lado",
    tap: "Elige la imagen que está de lado",
    cta: "Elegir fotos",
  };
}

export function ImageKitTool({ kind }: { kind: ImageKitSlug }) {
  const { pro, limit, upgrade, setUpgrade, beforeRun, afterRun } = useJobGuard();
  const stage = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
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
        setError(
          "Sube un HEIC o HEIF. Si el iPhone ya te lo abre como JPG, no hace falta esta herramienta.",
        );
        return;
      }
    }
    if (picked.length === 0) {
      setError("Sube JPG, PNG, WebP o HEIC.");
      return;
    }
    const next: Item[] = [];
    for (const file of picked) {
      if (file.size > limit.imageBytes) {
        setUpgrade(
          pro
            ? `${file.name} pesa más de ${bytesLabel(limit.imageBytes)}.`
            : `${file.name} pesa más de ${bytesLabel(limit.imageBytes)}. Pro admite archivos más grandes.`,
        );
        return;
      }
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
      if (merged.length > limit.imageFiles) {
        setUpgrade(
          pro
            ? `Como máximo ${limit.imageFiles} imágenes.`
            : `Gratis son ${limit.imageFiles} imágenes por tanda. Pro es ilimitado.`,
        );
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

  function pointInStage(event: React.PointerEvent<HTMLDivElement>) {
    const box = stage.current?.getBoundingClientRect();
    if (!box) return null;
    return {
      px: Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)),
      py: Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)),
    };
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (kind !== "crop") return;
    event.preventDefault();
    const point = pointInStage(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const inside =
      point.px >= crop.x &&
      point.px <= crop.x + crop.w &&
      point.py >= crop.y &&
      point.py <= crop.y + crop.h;
    drag.current = {
      x: point.px,
      y: point.py,
      mode: inside ? "move" : "new",
      start: crop,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    event.preventDefault();
    const point = pointInStage(event);
    if (!point) return;
    if (drag.current.mode === "move") {
      const dx = point.px - drag.current.x;
      const dy = point.py - drag.current.y;
      const nx = Math.min(
        1 - drag.current.start.w,
        Math.max(0, drag.current.start.x + dx),
      );
      const ny = Math.min(
        1 - drag.current.start.h,
        Math.max(0, drag.current.start.y + dy),
      );
      setCrop({ ...drag.current.start, x: nx, y: ny });
      return;
    }
    const x = Math.min(drag.current.x, point.px);
    const y = Math.min(drag.current.y, point.py);
    setCrop({
      x,
      y,
      w: Math.max(0.08, Math.abs(point.px - drag.current.x)),
      h: Math.max(0.08, Math.abs(point.py - drag.current.y)),
    });
  }

  function applyCropPreset(preset: "full" | "square" | "wide") {
    const first = items[0];
    if (!first) return;
    const ar = first.width / first.height;
    if (preset === "full") {
      setCrop({ x: 0, y: 0, w: 1, h: 1 });
      return;
    }
    if (preset === "square") {
      if (ar >= 1) {
        const w = first.height / first.width;
        setCrop({ x: (1 - w) / 2, y: 0, w, h: 1 });
      } else {
        const h = first.width / first.height;
        setCrop({ x: 0, y: (1 - h) / 2, w: 1, h });
      }
      return;
    }
    const target = 16 / 9;
    if (ar >= target) {
      const w = (first.height * target) / first.width;
      setCrop({ x: (1 - w) / 2, y: 0, w, h: 1 });
    } else {
      const h = first.width / first.height / target;
      setCrop({ x: 0, y: (1 - h) / 2, w: 1, h });
    }
  }

  async function run() {
    if (items.length === 0) {
      setError("Elige al menos una imagen.");
      return;
    }
    if (!beforeRun()) return;
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
      let result: Awaited<ReturnType<typeof downloadBlob>>;
      if (outputs.length === 1) {
        const file = outputs[0];
        const copy = new Uint8Array(file.bytes);
        result = await downloadBlob(
          new Blob([copy], { type: mimeFor(targetFormat(kind, items[0].file)) }),
          file.name,
        );
      } else {
        const zipped = zipBlobs(outputs);
        const copy = new Uint8Array(zipped);
        result = await downloadBlob(
          new Blob([copy], { type: "application/zip" }),
          "imagenes-luna-oficio.zip",
        );
      }
      const ratio =
        totalOut < totalIn ? Math.round((1 - totalOut / totalIn) * 100) : 0;
      const ready =
        kind === "compress"
          ? totalOut < totalIn
            ? `Listo: ${formatBytes(totalIn)} → ${formatBytes(totalOut)} (${ratio} % menos).`
            : `Se ha reescrito (${formatBytes(totalOut)}). Si no baja, es un PNG: pásalo a JPG.`
          : `Listo: ${outputs.length} archivo${outputs.length === 1 ? "" : "s"}.`;
      setNotice(noticeForSave(result, ready));
      afterRun();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo terminar.",
      );
    } finally {
      setBusy(false);
    }
  }

  const first = items[0];
  const copy = titles(kind);
  const action =
    kind === "compress"
      ? "Comprimir y guardar"
      : kind === "crop"
        ? "Recortar y guardar"
        : kind === "resize"
          ? "Redimensionar y guardar"
          : kind === "rotate"
            ? "Girar y guardar"
            : "Convertir y guardar";
  const wantsCamera = kind !== "heic";

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept={kind === "heic" ? ".heic,.heif,image/heic,image/heif" : acceptAll}
        multiple={kind !== "crop"}
        busy={busy}
        dropTitle={copy.drop}
        tapTitle={copy.tap}
        cta={copy.cta}
        cameraCta={wantsCamera ? "Hacer foto ahora" : undefined}
        hint="No se envía a ningún servidor. Quitar fondo, ampliar con IA y PDF a Word siguen aparcados."
        onFiles={(list) => void addFiles(list)}
      />
      <FreeCapNote
        text={`Gratis: ${limit.imageFiles} imágenes de ${bytesLabel(limit.imageBytes)} y ${limit.jobsPerDay} tareas al día`}
      />
      {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}

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
              inputMode="numeric"
              min={16}
              className="h-12"
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
              inputMode="numeric"
              min={16}
              className="h-12"
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
          <label className="flex min-h-12 items-center gap-3 text-sm sm:col-span-2">
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
        <div className="mt-6 grid grid-cols-3 gap-2">
          {([90, 180, 270] as Turn[]).map((value) => (
            <Button
              key={value}
              type="button"
              className="h-12"
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
                className="size-14 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.width}×{item.height} · {formatBytes(item.file.size)}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-11"
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
            Arrastra un recuadro nuevo. Si pulsas dentro, lo mueves. La página no
            se desplaza.
          </p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => applyCropPreset("full")}
            >
              Toda
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => applyCropPreset("square")}
            >
              Cuadrado
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => applyCropPreset("wide")}
            >
              16:9
            </Button>
          </div>
          <div
            ref={stage}
            className="relative mx-auto inline-block max-w-full cursor-crosshair touch-none overflow-hidden rounded-xl ring-1 ring-foreground/10 select-none"
            style={{ touchAction: "none" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={first.preview}
              alt="Recortar"
              className="pointer-events-none block max-h-[70dvh] max-w-full select-none"
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
          className="h-12 w-full px-5 sm:w-auto"
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
