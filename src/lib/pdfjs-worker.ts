/**
 * Hostinger sirve `.mjs` como text/plain. El navegador no deja importar
 * un módulo ES con ese MIME y PDF.js acaba en "Setting up fake worker failed".
 * El mismo archivo con extensión `.js` sí sale como JavaScript.
 */
export const PDFJS_WORKER_SRC = "/pdf.worker.min.js";

export async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  return pdfjs;
}
