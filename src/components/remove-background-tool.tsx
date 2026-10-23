"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { isImageFile, suggestedOutName } from "@/lib/image-ops";
import { bytesLabel } from "@/lib/limits";
import { removeBackground } from "@/lib/remove-background";
import { noticeForSave, saveBlob } from "@/lib/save-file";

const accept =
  "image/*,image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

export function RemoveBackgroundTool({ locale = "es" }: { locale?: "es" | "en" } = {}) {
  const en = locale === "en";
  const tr = (es: string, english: string) => (en ? english : es);
  const { pro, limit, upgrade, beforeRun, afterRun } = useJobGuard(locale);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [name, setName] = useState(locale === "en" ? "no-background.png" : "sin-fondo.png");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function take(file: File | undefined) {
    if (!file) return;
    setError("");
    setNotice("");
    if (!isImageFile(file)) {
      setError(tr("Elige un JPG, PNG, WebP o HEIC.", "Choose a JPG, PNG, WebP or HEIC."));
      return;
    }
    if (file.size > limit.imageBytes) {
      setError(
        pro
          ? en
            ? `The photo is larger than ${bytesLabel(limit.imageBytes)}.`
            : `La foto pesa más de ${bytesLabel(limit.imageBytes)}.`
          : en
            ? `The free plan allows ${bytesLabel(limit.imageBytes)}. Pro accepts larger photos.`
            : `Gratis son ${bytesLabel(limit.imageBytes)}. Pro admite fotos más grandes.`,
      );
      return;
    }
    if (!beforeRun()) return;
    setBusy(true);
    setBlob(null);
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    try {
      const result = await removeBackground(file, setStatus, locale);
      setBlob(result.blob);
      setPreview(URL.createObjectURL(result.blob));
      setName(suggestedOutName(file.name, en ? "no-background" : "sin-fondo", "png"));
      setStatus("");
      afterRun();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message || tr("No se pudo quitar el fondo.", "Could not remove the background."));
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!blob) return;
    const result = await saveBlob(blob, name);
    setNotice(
      noticeForSave(
        result,
        tr("PNG con el fondo transparente.", "PNG with a transparent background."),
        locale,
      ),
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept={accept}
        busy={busy}
        dropTitle={tr("Suelta la foto", "Drop the photo")}
        tapTitle={tr("Elige la foto", "Choose the photo")}
        cta={tr("Elegir foto", "Choose photo")}
        cameraCta={tr("Hacer foto ahora", "Take a photo")}
        hint={tr(
          "La foto no se sube. El modelo se descarga una vez en este aparato.",
          "The photo is not uploaded. The model downloads once onto this device.",
        )}
        busyHint={status || tr("Quitando el fondo…", "Removing the background…")}
        busyTitle={en ? "Opening…" : undefined}
        onFiles={(list) => void take(list[0])}
      />
      <FreeCapNote
        locale={locale}
        text={
          en
            ? `Free: photos up to ${bytesLabel(limit.imageBytes)} and ${limit.jobsPerDay} tasks a day. One photo at a time.`
            : `Gratis: fotos de hasta ${bytesLabel(limit.imageBytes)} y ${limit.jobsPerDay} tareas al día. Una foto cada vez.`
        }
      />
      {upgrade ? <UpgradeNudge reason={upgrade} compact locale={locale} /> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-muted-foreground">{notice}</p> : null}
      {preview ? (
        <div className="mt-6">
          <div
            className="overflow-hidden rounded-2xl border border-foreground/10 p-3"
            style={{
              backgroundColor: "#f4f1ea",
              backgroundImage:
                "linear-gradient(45deg, #e4dfd4 25%, transparent 25%), linear-gradient(-45deg, #e4dfd4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4dfd4 75%), linear-gradient(-45deg, transparent 75%, #e4dfd4 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
            }}
          >
            {/* The checkerboard shows the transparent pixels. */}
            <img
              src={preview}
              alt={tr("Foto sin fondo", "Photo with the background removed")}
              className="mx-auto max-h-[28rem] w-full object-contain"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void download()}>
              <Download />
              {tr("Guardar PNG", "Save PNG")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setBlob(null);
                setPreview((current) => {
                  if (current) URL.revokeObjectURL(current);
                  return "";
                });
                setNotice("");
              }}
            >
              {tr("Otra foto", "Another photo")}
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {tr(
              "El pelo fino y un fondo del mismo color que la ropa pueden quedar irregulares. Sirve para un producto, un logo o un retrato sencillo.",
              "Fine hair, and a background the same color as the clothes, can look uneven. It works well for a product, a logo or a simple portrait.",
            )}
          </p>
        </div>
      ) : null}
    </div>
  );
}
