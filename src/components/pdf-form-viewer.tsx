"use client";

import { useEffect, useRef, useState } from "react";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import "@/components/pdfjs-form-layer.css";

type PdfjsNs = Awaited<ReturnType<typeof loadPdfjs>>;
type PdfDoc = Awaited<ReturnType<PdfjsNs["getDocument"]>["promise"]>;

const linkService = {
  externalLinkEnabled: true,
  addLinkAttributes(element: HTMLAnchorElement, url: string, newWindow?: boolean) {
    element.href = url;
    element.rel = "noopener noreferrer";
    if (newWindow) element.target = "_blank";
  },
  getDestinationHash() {
    return "#";
  },
  getAnchorUrl() {
    return "#";
  },
  async goToDestination() {},
  goToPage() {},
  executeNamedAction() {},
  executeSetOCGState() {},
  isPageVisible() {
    return true;
  },
};

export type PdfFormHandle = {
  save: () => Promise<Uint8Array>;
  pageCount: number;
  fieldCount: number;
  xfa: boolean;
};

export function PdfFormViewer({
  data,
  pageIndex,
  scale,
  onMeta,
}: {
  data: ArrayBuffer;
  pageIndex: number;
  scale: number;
  onMeta: (meta: PdfFormHandle) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PdfDoc | null>(null);
  const taskRef = useRef<{ destroy: () => Promise<void> } | null>(null);
  const onMetaRef = useRef(onMeta);
  onMetaRef.current = onMeta;
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let gone = false;
    const copy = data.slice(0);
    void (async () => {
      setError("");
      setReady(false);
      const pdfjs = await loadPdfjs();
      if (taskRef.current) {
        try {
          await taskRef.current.destroy();
        } catch {
          // ya cerrado
        }
        taskRef.current = null;
        pdfRef.current = null;
      }
      const task = pdfjs.getDocument({
        data: new Uint8Array(copy),
        useWasm: false,
        enableXfa: true,
      });
      taskRef.current = task;
      const pdf = await task.promise;
      if (gone) {
        await task.destroy();
        return;
      }
      pdfRef.current = pdf;
      const objects = await pdf.getFieldObjects();
      let fieldCount = 0;
      if (objects) {
        fieldCount =
          objects instanceof Map
            ? objects.size
            : Object.keys(objects as object).length;
      }
      onMetaRef.current({
        pageCount: pdf.numPages,
        fieldCount,
        xfa: pdf.isPureXfa,
        save: async () => {
          try {
            return await pdf.saveDocument();
          } catch {
            return pdf.getData();
          }
        },
      });
      setReady(true);
    })().catch((caught) => {
      if (!gone) {
        setError(
          caught instanceof Error
            ? caught.message
            : "No se pudo abrir el formulario del PDF.",
        );
      }
    });
    return () => {
      gone = true;
      const current = taskRef.current;
      taskRef.current = null;
      pdfRef.current = null;
      if (current) void current.destroy();
    };
  }, [data]);

  useEffect(() => {
    if (!ready || !pdfRef.current) return;
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !layer || !wrap) return;
    let cancelled = false;
    void (async () => {
      const pdfjs = await loadPdfjs();
      const page = await pdf.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });
      wrap.style.width = `${Math.floor(viewport.width)}px`;
      wrap.style.height = `${Math.floor(viewport.height)}px`;
      wrap.style.setProperty("--total-scale-factor", String(viewport.scale));
      wrap.style.setProperty("--scale-round-x", "1px");
      wrap.style.setProperty("--scale-round-y", "1px");

      const ratio = 1;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

      layer.replaceChildren();
      layer.hidden = false;

      if (pdf.isPureXfa) {
        canvas.hidden = true;
        const html = await page.getXfa();
        if (cancelled || !html) return;
        pdfjs.XfaLayer.render({
          viewport,
          div: layer,
          xfaHtml: html,
          annotationStorage: pdf.annotationStorage,
          linkService: linkService as never,
        });
        layer.className = "xfaLayer";
        return;
      }

      canvas.hidden = false;
      layer.className = "annotationLayer";
      await page.render({
        canvas,
        viewport,
        annotationMode: pdfjs.AnnotationMode.ENABLE_FORMS,
      }).promise;
      if (cancelled) return;
      const annotations = await page.getAnnotations({ intent: "display" });
      const fieldObjects = await pdf.getFieldObjects();
      const annotationLayer = new pdfjs.AnnotationLayer({
        div: layer,
        page,
        viewport,
        annotationStorage: pdf.annotationStorage,
        linkService: linkService as never,
      } as never);
      await annotationLayer.render({
        annotations,
        viewport: viewport.clone({ dontFlip: true }),
        div: layer,
        page,
        renderForms: true,
        annotationStorage: pdf.annotationStorage,
        linkService: linkService as never,
        fieldObjects: fieldObjects as never,
      });
    })().catch((caught) => {
      if (!cancelled) {
        setError(
          caught instanceof Error
            ? caught.message
            : "No se pudieron pintar los campos.",
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready, pageIndex, scale]);

  return (
    <div className="overflow-auto">
      {error ? (
        <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!ready && !error ? (
        <p className="mb-3 text-sm text-muted-foreground">Abriendo las casillas del PDF…</p>
      ) : null}
      <div
        ref={wrapRef}
        className="luna-pdf-page relative mx-auto bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10"
      >
        <canvas ref={canvasRef} className="block" />
        <div ref={layerRef} />
      </div>
    </div>
  );
}
