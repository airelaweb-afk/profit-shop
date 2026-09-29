"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AudioKitSlug } from "@/lib/image-kit";
import { decodeAudio, encodeWav, isAudioFile } from "@/lib/audio-ops";
import { suggestedOutName } from "@/lib/image-ops";
import { noticeForSave, saveBlob } from "@/lib/save-file";

export function AudioKitTool({ kind }: { kind: AudioKitSlug }) {
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
      setError("Sube un MP3, M4A, OGG, WAV o WebM. No extraemos audio de un vídeo.");
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
      setError(caught instanceof Error ? caught.message : "No se pudo leer.");
    } finally {
      setBusy(false);
    }
  }

  async function run() {
    if (!file || !buffer) {
      setError("Elige un audio.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blob =
        kind === "trim"
          ? encodeWav(buffer, start, end)
          : encodeWav(buffer);
      const result = await saveBlob(
        blob,
        suggestedOutName(file.name, kind === "trim" ? "recorte" : "audio", "wav"),
      );
      const ready =
        kind === "trim"
          ? `Listo: de ${start.toFixed(1)} s a ${end.toFixed(1)} s, en WAV.`
          : "Listo: WAV. Codificar a MP3 queda aparcado.";
      setNotice(noticeForSave(result, ready));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar.");
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
        dropTitle={kind === "trim" ? "Suelta la nota de voz" : "Suelta el audio"}
        tapTitle={kind === "trim" ? "Elige la nota de voz" : "Elige el audio"}
        cta="Elegir audio"
        hint="MP3, M4A, OGG o WAV. Sale un WAV. Extraer el audio de un MP4 o convertir a MP3 queda para más adelante."
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
                Desde {start.toFixed(1)} s
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
              <Label htmlFor="audio-end">Hasta {end.toFixed(1)} s</Label>
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
          {busy ? "Preparando…" : <Download />}
          {busy ? "" : kind === "trim" ? "Recortar a WAV" : "Guardar WAV"}
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
