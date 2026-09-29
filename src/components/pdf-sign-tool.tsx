"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  FileUp,
  PenLine,
  Trash2,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_PDF_BYTES,
  clickToPdfPoint,
  createBlankSheet,
  exportSignedPdf,
  formatPdfDate,
  listPdfFields,
  suggestedFileName,
  type PdfFormField,
  type PdfStamp,
} from "@/lib/pdf-fill";
import { newId } from "@/lib/quotes";

type Mode = "idle" | "text" | "date" | "sign";
type PageSize = { width: number; height: number };

function dataUrlFromCanvas(canvas: HTMLCanvasElement) {
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;
  if (canvas.toDataURL() === blank.toDataURL()) return "";
  return canvas.toDataURL("image/png");
}

export function PdfSignTool() {
  const fileInput = useRef<HTMLInputElement>(null);
  const signCanvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const pdfBytes = useRef<ArrayBuffer | null>(null);

  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fields, setFields] = useState<PdfFormField[]>([]);
  const [stamps, setStamps] = useState<PdfStamp[]>([]);
  const [mode, setMode] = useState<Mode>("idle");
  const [textValue, setTextValue] = useState("");
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const resetPad = useCallback(() => {
    const canvas = signCanvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  }, []);

  useEffect(() => {
    const pad = signCanvas.current;
    const ink = pad?.getContext("2d") ?? null;
    if (!pad || !ink) return;

    function attachPad(
      surface: HTMLCanvasElement,
      stroke: CanvasRenderingContext2D,
    ) {
      stroke.lineWidth = 2.2;
      stroke.lineCap = "round";
      stroke.strokeStyle = "#1f1812";

      function point(event: PointerEvent) {
        const rect = surface.getBoundingClientRect();
        return {
          x: ((event.clientX - rect.left) / rect.width) * surface.width,
          y: ((event.clientY - rect.top) / rect.height) * surface.height,
        };
      }

      function down(event: PointerEvent) {
        drawing.current = true;
        surface.setPointerCapture(event.pointerId);
        const { x, y } = point(event);
        stroke.beginPath();
        stroke.moveTo(x, y);
      }
      function move(event: PointerEvent) {
        if (!drawing.current) return;
        const { x, y } = point(event);
        stroke.lineTo(x, y);
        stroke.stroke();
      }
      function up() {
        if (!drawing.current) return;
        drawing.current = false;
        setSignature(dataUrlFromCanvas(surface));
      }

      surface.addEventListener("pointerdown", down);
      surface.addEventListener("pointermove", move);
      surface.addEventListener("pointerup", up);
      surface.addEventListener("pointerleave", up);
      return () => {
        surface.removeEventListener("pointerdown", down);
        surface.removeEventListener("pointermove", move);
        surface.removeEventListener("pointerup", up);
        surface.removeEventListener("pointerleave", up);
      };
    }

    return attachPad(pad, ink);
  }, []);

  async function renderPages(data: ArrayBuffer) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const task = pdfjs.getDocument({
      data: new Uint8Array(data.slice(0)),
      useWasm: false,
    });
    const pdf = await task.promise;
    const nextSizes: PageSize[] = [];
    const nextPreviews: string[] = [];
    const count = pdf.numPages;
    const max = Math.min(count, 40);
    for (let number = 1; number <= max; number += 1) {
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      nextSizes.push({ width: base.width, height: base.height });
      const viewport = page.getViewport({ scale: 1.35 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;
      nextPreviews.push(canvas.toDataURL("image/png"));
    }
    await pdf.cleanup();
    await task.destroy();
    setPageCount(count);
    setSizes(nextSizes);
    setPreviews(nextPreviews);
    return count;
  }

  async function openBytes(data: ArrayBuffer, name: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (data.byteLength > MAX_PDF_BYTES) {
        throw new Error("El PDF pesa más de 20 MB. Usa uno más ligero.");
      }
      pdfBytes.current = data.slice(0);
      setLoaded(true);
      setFileName(name);
      setStamps([]);
      const found = await listPdfFields(data.slice(0));
      setFields(found);
      const pages = await renderPages(data.slice(0));
      const extra =
        pages > 40
          ? " Solo se muestran las primeras 40 páginas; el PDF descargado lleva todas."
          : "";
      setNotice(
        (found.length
          ? `PDF con ${found.length} campo${found.length === 1 ? "" : "s"} para rellenar. También puedes escribir y firmar encima.`
          : "Este PDF no trae campos. Pulsa en la hoja para escribir, poner la fecha o la firma.") +
          extra,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo abrir el PDF. Si está protegido con contraseña, quítala primero.",
      );
      pdfBytes.current = null;
      setLoaded(false);
      setPreviews([]);
      setFields([]);
    } finally {
      setBusy(false);
    }
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type && file.type !== "application/pdf") {
      setError("Sube un archivo PDF.");
      return;
    }
    const data = await file.arrayBuffer();
    await openBytes(data, file.name);
  }

  async function openBlank() {
    const data = await createBlankSheet();
    await openBytes(data, "documento-para-firmar.pdf");
  }

  function placeStamp(
    pageIndex: number,
    point: { x: number; y: number },
    size: PageSize,
  ) {
    if (mode === "idle") return;
    if (mode === "sign" && !signature) {
      setError("Dibuja la firma arriba y luego pulsa en el PDF.");
      return;
    }
    if (mode === "text" && !textValue.trim()) {
      setError("Escribe el texto y luego pulsa donde debe ir.");
      return;
    }
    setError("");
    const id = newId();
    if (mode === "sign") {
      const width = 132;
      const height = 52;
      setStamps((current) => [
        ...current,
        {
          id,
          pageIndex,
          kind: "signature",
          x: Math.min(point.x, size.width - width),
          y: Math.max(8, point.y - height / 2),
          width,
          height,
          text: "",
          imageDataUrl: signature,
        },
      ]);
      return;
    }
    const text = mode === "date" ? formatPdfDate() : textValue.trim();
    const width = Math.min(size.width - 24, Math.max(72, text.length * 6.2));
    setStamps((current) => [
      ...current,
      {
        id,
        pageIndex,
        kind: mode,
        x: Math.min(point.x, size.width - 12),
        y: Math.min(point.y, size.height - 12),
        width,
        height: 14,
        text,
        imageDataUrl: "",
      },
    ]);
  }

  async function download() {
    if (!pdfBytes.current) {
      setError("Abre un PDF o crea una hoja en blanco.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const bytes = await exportSignedPdf({
        data: pdfBytes.current.slice(0),
        fields,
        stamps,
      });
      const copy = new Uint8Array(bytes);
      const blob = new Blob([copy], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = suggestedFileName(fileName);
      link.click();
      URL.revokeObjectURL(url);
      setNotice("Listo. El archivo se ha descargado en este ordenador.");
    } catch {
      setError("No se pudo guardar. Prueba con otro PDF (sin contraseña).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <div className="no-print flex flex-col gap-6">
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">El archivo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No se sube a ningún servidor. Si el PDF ya trae cajas, las rellenas
            aquí. Si no, escribes y firmas encima, como en papel.
          </p>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => void onFile(event)}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              <FileUp />
              Abrir PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void openBlank()}
              disabled={busy}
            >
              Hoja en blanco
            </Button>
          </div>
          {fileName ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {fileName}
              {pageCount ? ` · ${pageCount} página${pageCount === 1 ? "" : "s"}` : ""}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Escribir y firmar</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige qué colocar y pulsa en la hoja, donde iría en el papel.
          </p>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pdf-text">Texto</Label>
              <Input
                id="pdf-text"
                className="h-10"
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder="Nombre, NIF, “conforme”…"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={mode === "text" ? "default" : "outline"}
                onClick={() => setMode(mode === "text" ? "idle" : "text")}
              >
                <Type />
                Colocar texto
              </Button>
              <Button
                type="button"
                variant={mode === "date" ? "default" : "outline"}
                onClick={() => setMode(mode === "date" ? "idle" : "date")}
              >
                Colocar fecha
              </Button>
              <Button
                type="button"
                variant={mode === "sign" ? "default" : "outline"}
                onClick={() => setMode(mode === "sign" ? "idle" : "sign")}
              >
                <PenLine />
                Colocar firma
              </Button>
            </div>
            {mode !== "idle" ? (
              <p className="text-sm text-primary">
                {mode === "sign"
                  ? "Dibuja la firma y pulsa en el PDF."
                  : mode === "date"
                    ? "Pulsa en el PDF para poner la fecha de hoy."
                    : "Pulsa en el PDF para pegar el texto."}
              </p>
            ) : null}
          </div>
          <div className="mt-4">
            <Label htmlFor="pdf-sign">Firma (dibuja con el dedo o el ratón)</Label>
            <canvas
              id="pdf-sign"
              ref={signCanvas}
              width={640}
              height={200}
              className="mt-2 h-28 w-full touch-none rounded-xl border border-dashed border-foreground/20 bg-background"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={resetPad}
            >
              <Eraser />
              Borrar firma
            </Button>
          </div>
        </section>

        {fields.length > 0 ? (
          <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
            <h2 className="font-heading text-2xl">Campos del PDF</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Estos venían en el archivo (formularios de Hacienda, bancos,
              colegios…).
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {fields.map((field, index) => (
                <li key={`${field.name}-${index}`} className="grid gap-1.5">
                  <Label htmlFor={`field-${index}`}>{field.name}</Label>
                  {field.kind === "check" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        id={`field-${index}`}
                        type="checkbox"
                        checked={field.checked}
                        onChange={(event) =>
                          setFields((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, checked: event.target.checked }
                                : item,
                            ),
                          )
                        }
                      />
                      Marcado
                    </label>
                  ) : field.kind === "choice" ? (
                    <select
                      id={`field-${index}`}
                      className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={field.value}
                      onChange={(event) =>
                        setFields((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="">—</option>
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      id={`field-${index}`}
                      className="h-10"
                      value={field.value}
                      onChange={(event) =>
                        setFields((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            {notice}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="lg"
            className="h-11 px-5"
            onClick={() => void download()}
            disabled={busy || !loaded}
          >
            {busy ? "Preparando…" : <Download />}
            {busy ? "" : "Descargar PDF firmado"}
          </Button>
          {stamps.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStamps([])}
            >
              <Trash2 />
              Quitar textos y firmas
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        {busy && previews.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
            <p className="font-heading text-2xl">Abriendo el PDF…</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Se dibuja aquí, en este ordenador. Un archivo grande tarda un
              momento.
            </p>
          </div>
        ) : previews.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
            <p className="font-heading text-2xl">Aún no hay PDF</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Abre el que te han mandado, o crea una hoja en blanco si solo
              necesitas una firma.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-6">
            {previews.map((src, pageIndex) => {
              const size = sizes[pageIndex];
              if (!size) return null;
              const pageStamps = stamps.filter(
                (stamp) => stamp.pageIndex === pageIndex,
              );
              return (
                <li key={src.slice(-24) + pageIndex}>
                  <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                    Página {pageIndex + 1}
                  </p>
                  <div
                    className={`relative overflow-hidden rounded-sm bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10 ${
                      mode === "idle" ? "" : "cursor-crosshair"
                    }`}
                    onClick={(event) => {
                      if (
                        event.target !== event.currentTarget &&
                        !(event.target instanceof HTMLImageElement)
                      ) {
                        return;
                      }
                      const image = event.currentTarget.querySelector("img");
                      if (!(image instanceof HTMLImageElement)) return;
                      placeStamp(
                        pageIndex,
                        clickToPdfPoint(event, image, size.width, size.height),
                        size,
                      );
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Página ${pageIndex + 1} del PDF`}
                      className="block w-full select-none"
                      draggable={false}
                    />
                    {pageStamps.map((stamp) => (
                      <button
                        key={stamp.id}
                        type="button"
                        className="absolute z-10 rounded-sm bg-amber-200/40 ring-1 ring-amber-700/40"
                        style={{
                          left: `${(stamp.x / size.width) * 100}%`,
                          top: `${((size.height - stamp.y - stamp.height) / size.height) * 100}%`,
                          width: `${(stamp.width / size.width) * 100}%`,
                          height: `${(stamp.height / size.height) * 100}%`,
                        }}
                        title="Quitar"
                        onClick={(event) => {
                          event.stopPropagation();
                          setStamps((current) =>
                            current.filter((item) => item.id !== stamp.id),
                          );
                        }}
                      >
                        {stamp.kind === "signature" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={stamp.imageDataUrl}
                            alt="Firma"
                            className="size-full object-contain"
                          />
                        ) : (
                          <span className="block px-1 text-left text-[11px] leading-4 text-foreground">
                            {stamp.text}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
