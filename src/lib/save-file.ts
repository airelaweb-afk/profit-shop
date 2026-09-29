function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2_500);
}

export function prefersShareSheet() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const appleTouch =
    "ontouchend" in document &&
    /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  return coarse || appleTouch;
}

export type SaveResult = "shared" | "saved" | "cancelled";

export async function saveBlob(
  blob: Blob, filename: string,
): Promise<SaveResult> {
  const type = blob.type || "application/octet-stream";
  const file = new File([blob], filename, { type });
  if (prefersShareSheet() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }
  triggerDownload(blob, filename);
  return "saved";
}

export async function saveBytes(
  bytes: Uint8Array,
  filename: string,
  mime: string,
) {
  const copy = new Uint8Array(bytes);
  return saveBlob(new Blob([copy], { type: mime }), filename);
}

export function noticeForSave(result: SaveResult, ready: string) {
  if (result === "cancelled") {
    return "Has cerrado el menú. Pulsa otra vez para guardar o enviar.";
  }
  if (result === "shared") {
    return `${ready} En el teléfono elige Guardar en Archivos o envíalo.`;
  }
  return ready;
}
