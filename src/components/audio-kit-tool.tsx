"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AudioKitSlug } from "@/lib/image-kit";
import { decodeAudio, encodeWav, isAudioFile } from "@/lib/audio-ops";
import { suggestedOutName } from "@/lib/image-ops";
import { noticeForSave, saveBlob } from "@/lib/save-file";

export function AudioKitTool({
  kind,
  locale = "es",
}: {
  kind: AudioKitSlug;
  locale?: "es" | "en";
}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
  const { beforeRun, afterRun } = useJobGuard(locale);
  const [file, setFile] = useState<File | null>(null);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function take(next: File | undefined) {
    if (!next) return;
    setError("");
    setNotice("");
    if (!isAudioFile(next)) {
      setError(t("Sube un MP3, M4A, OGG, WAV o WebM. No extraemos audio de un vídeo.", "Upload an MP3, M4A, OGG, WAV or WebM. We do not extract audio from a video."));
      return;
    }
    setBusy(true);
    try {
      const decoded = await decodeAudio(next);
      setFile(next);
      setBuffer(decoded);
      setStart(0);
      setEnd(Number(decoded.duration.toFixed(2)));
    } catch (caught) {
      setFile(null);
      setBuffer(null);
      setError(caught instanceof Error ? caught.message : t("No se pudo leer.", "Could not read it."));
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    if (!file || !buffer) {
      setError(t("Elige un audio.", "Choose an audio file."));
      return;
    }
    if (!beforeRun()) return;
    setBusy(true);
    setError("");
    try {
      const blob =
        kind === "trim"
          ? encodeWav(buffer, start, end)
          : encodeWav(buffer);
      const result = await saveBlob(
        blob,
        suggestedOutName(file.name, kind === "trim" ? (en ? "trim" : "recorte") : "audio", "wav"),
      );
      const ready =
        kind === "trim"
          ? en
            ? `Done: from ${start.toFixed(1)} s to ${end.toFixed(1)} s, as WAV.`
            : `Listo: de ${start.toFixed(1)} s a ${end.toFixed(1)} s, en WAV.`
          : t("Listo: WAV. Codificar a MP3 queda aparcado.", "Done: WAV. Encoding to MP3 is not available.");
      setNotice(noticeForSave(result, ready, locale));
      afterRun();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("No se pudo guardar.", "Could not save."));
    } finally {
      setBusy(false);
    }
  }

  const duration = buffer?.duration ?? 0;

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept="audio/*,.mp3,.m4a,.aac,.ogg,.wav,.webm"
        busy={busy}
        dropTitle={kind === "trim" ? t("Suelta la nota de voz", "Drop the voice note") : t("Suelta el audio", "Drop the audio")}
        tapTitle={kind === "trim" ? t("Elige la nota de voz", "Choose the voice note") : t("Elige el audio", "Choose the audio")}
        cta={t("Elegir audio", "Choose audio")}
        hint={t(
          "MP3, M4A, OGG o WAV. Sale un WAV. Extraer el audio de un MP4 o convertir a MP3 queda para más adelante.",
          "MP3, M4A, OGG or WAV. You get a WAV. Pulling audio from an MP4, or encoding MP3, is not available.",
        )}
        busyTitle={en ? "Opening…" : undefined}
        onFiles={(list) => void take(list[0])}
      />
      {file && buffer ? (
        <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-foreground/10">
          <p className="text-sm">
            {file.name} · {duration.toFixed(1)} s
          </p>
          {kind === "trim" ? (
            <div className="mt-4 grid gap-3">
              <Label htmlFor="audio-start">
                {t("Desde", "From")} {start.toFixed(1)} s
              </Label>
              <input
                id="audio-start"
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={start}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setStart(Math.min(value, end - 0.1));
                }}
              />
              <Label htmlFor="audio-end">{t("Hasta", "To")} {end.toFixed(1)} s</Label>
              <input
                id="audio-end"
                type="range"
                min={0}
                max={duration}
                step={0.1}
                value={end}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setEnd(Math.max(value, start + 0.1));
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full px-5 sm:w-auto"
          disabled={busy || !buffer}
          onClick={() => void run()}
        >
          {busy ? t("Preparando…", "Preparing…") : <Download />}
          {busy ? "" : kind === "trim" ? t("Recortar a WAV", "Trim to WAV") : t("Guardar WAV", "Save WAV")}
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
