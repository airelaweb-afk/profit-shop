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

export function RemoveBackgroundTool() {
  const { pro, limit, upgrade, beforeRun, afterRun } = useJobGuard();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [name, setName] = useState("sin-fondo.png");

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
      setError("Elige un JPG, PNG, WebP o HEIC.");
      return;
    }
    if (file.size > limit.imageBytes) {
      setError(
        pro
          ? `La foto pesa más de ${bytesLabel(limit.imageBytes)}.`
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
      const result = await removeBackground(file, setStatus);
      setBlob(result.blob);
      setPreview(URL.createObjectURL(result.blob));
      setName(suggestedOutName(file.name, "sin-fondo", "png"));
      setStatus("");
      afterRun();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      setError(message || "No se pudo quitar el fondo.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  async function download() {
    if (!blob) return;
    const result = await saveBlob(blob, name);
    setNotice(noticeForSave(result, "PNG con el fondo transparente."));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept={accept}
        busy={busy}
        dropTitle="Suelta la foto"
        tapTitle="Elige la foto"
        cta="Elegir foto"
        cameraCta="Hacer foto ahora"
        hint="La foto no se sube. El modelo se descarga una vez en este aparato."
        busyHint={status || "Quitando el fondo…"}
        onFiles={(list) => void take(list[0])}
      />
      <FreeCapNote
        text={`Gratis: fotos de hasta ${bytesLabel(limit.imageBytes)} y ${limit.jobsPerDay} tareas al día. Una foto cada vez.`}
      />
      {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
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
            <img src={preview} alt="Foto sin fondo" className="mx-auto max-h-[28rem] w-full object-contain" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void download()}>
              <Download />
              Guardar PNG
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
              Otra foto
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            El pelo fino y un fondo del mismo color que la ropa pueden quedar
            irregulares. Sirve para un producto, un logo o un retrato sencillo.
          </p>
        </div>
      ) : null}
    </div>
  );
}
