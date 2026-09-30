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

export async function renderPdfPage(
  page: { render: (params: never) => { promise: Promise<unknown> } },
  canvas: HTMLCanvasElement,
  viewport: unknown,
  annotationMode?: number,
) {
  const canvasContext = canvas.getContext("2d", { alpha: false });
  if (!canvasContext) {
    throw new Error("Este navegador no puede pintar el PDF.");
  }
  canvasContext.setTransform(1, 0, 0, 1, 0, 0);
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  const render = page.render as (params: {
    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;
    viewport: unknown;
    annotationMode?: number;
  }) => { promise: Promise<unknown> };
  return render({
    canvas,
    canvasContext,
    viewport,
    annotationMode,
  }).promise;
}
