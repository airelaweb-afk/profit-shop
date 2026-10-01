/**
 * Hostinger sirve `.mjs` como text/plain. El navegador no deja importar
 * un módulo ES con ese MIME y PDF.js acaba en "Setting up fake worker failed".
 * El mismo archivo con extensión `.js` sí sale como JavaScript.
 */
export const PDFJS_WORKER_SRC = "/pdf.worker.min.js";

function copyBuffer(data: ArrayBuffer) {
  const copy = new ArrayBuffer(data.byteLength);
  new Uint8Array(copy).set(new Uint8Array(data));
  return copy;
}

/** Teléfono de verdad. Un Mac con trackpad no entra: rompería el editor de escritorio. */
export function isMobilePdfHost() {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  if (/iPhone|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  if (/iPad/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) {
    return window.matchMedia("(pointer: coarse)").matches;
  }
  return false;
}

let blobWorkerSrc: string | null = null;
let blobWorkerTried = false;

async function workerSrcForHost(): Promise<string> {
  if (!isMobilePdfHost()) return PDFJS_WORKER_SRC;
  if (blobWorkerSrc) return blobWorkerSrc;
  if (blobWorkerTried) return PDFJS_WORKER_SRC;
  blobWorkerTried = true;
  try {
    const response = await fetch(PDFJS_WORKER_SRC);
    if (!response.ok) return PDFJS_WORKER_SRC;
    const blob = new Blob([await response.text()], {
      type: "text/javascript",
    });
    blobWorkerSrc = URL.createObjectURL(blob);
    return blobWorkerSrc;
  } catch {
    return PDFJS_WORKER_SRC;
  }
}

export async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = await workerSrcForHost();
  return pdfjs;
}

export async function getPdfDocument(data: ArrayBuffer) {
  const pdfjs = await loadPdfjs();
  const mobile = isMobilePdfHost();
  return pdfjs.getDocument({
    data: new Uint8Array(copyBuffer(data)),
    useWasm: false,
    ...(mobile
      ? {
          disableStream: true,
          disableRange: true,
          disableAutoFetch: true,
          isEvalSupported: false,
        }
      : {}),
  });
}

export function hasPdfMagic(data: ArrayBuffer) {
  if (data.byteLength < 5) return false;
  const bytes = new Uint8Array(data, 0, 5);
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}
