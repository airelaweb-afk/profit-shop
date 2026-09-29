"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  Eraser,
  FileUp,
  PenLine,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_PDF_BYTES,
  TEXT_SIZE,
  clickToPdfPoint,
  createBlankSheet,
  exportSignedPdf,
  formatPdfDate,
  listPdfFields,
  markBox,
  suggestedFileName,
  type MarkSize,
  type PdfFormField,
  type PdfStamp,
} from "@/lib/pdf-fill";
import { newId } from "@/lib/quotes";

type Mode = "text" | "date" | "sign" | "check" | "cross";
type PageSize = { width: number; height: number };
type Typing = {
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
};

function dataUrlFromCanvas(canvas: HTMLCanvasElement) {
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;
  if (canvas.toDataURL() === blank.toDataURL()) return "";
  return canvas.toDataURL("image/png");
}

function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

export function PdfSignTool() {
  const fileInput = useRef<HTMLInputElement>(null);
  const signCanvas = useRef<HTMLCanvasElement>(null);
  const typingInput = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const pdfBytes = useRef<ArrayBuffer | null>(null);

  const [fileName, setFileName] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fields, setFields] = useState<PdfFormField[]>([]);
  const [stamps, setStamps] = useState<PdfStamp[]>([]);
  const [mode, setMode] = useState<Mode>("check");
  const [markSize, setMarkSize] = useState<MarkSize>("M");
  const [textValue, setTextValue] = useState("");
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);
  const [typing, setTyping] = useState<Typing | null>(null);
  const typingRef = useRef<Typing | null>(null);
  const drag = useRef<{
    id: string;
    originX: number;
    originY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    typingRef.current = typing;
  }, [typing]);

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
  }, [loaded]);

  useEffect(() => {
    if (!typing) return;
    typingInput.current?.focus();
  }, [typing]);

  useEffect(() => {
    if (!loaded) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        setTyping(null);
        setStamps((current) => current.slice(0, -1));
        return;
      }
      if (event.key === "1" || event.key.toLowerCase() === "c") setMode("check");
      if (event.key === "2" || event.key.toLowerCase() === "x") setMode("cross");
      if (event.key === "3" || event.key.toLowerCase() === "t") setMode("text");
      if (event.key.toLowerCase() === "d") setMode("date");
      if (event.key.toLowerCase() === "f") setMode("sign");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loaded]);

  const renderPages = useCallback(async (data: ArrayBuffer) => {
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
  }, []);

  useEffect(() => {
    if (!loaded || fields.length === 0) return;
    const source = pdfBytes.current;
    if (!source) return;
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const bytes = await exportSignedPdf({
            data: source.slice(0),
            fields,
            stamps: [],
          });
          const copy = new ArrayBuffer(bytes.byteLength);
          new Uint8Array(copy).set(bytes);
          await renderPages(copy);
        } catch {
          // El preview original sigue valiendo.
        }
      })();
    }, 400);
    return () => window.clearTimeout(handle);
  }, [fields, loaded, renderPages]);

  async function openBytes(data: ArrayBuffer, name: string) {
    setBusy(true);
    setError("");
    setNotice("");
    setTyping(null);
    try {
      if (data.byteLength > MAX_PDF_BYTES) {
        throw new Error("El PDF pesa más de 20 MB. Usa uno más ligero.");
      }
      pdfBytes.current = data.slice(0);
      setLoaded(true);
      setFileName(name);
      setStamps([]);
      const found = await listPdfFields(data.slice(0));
      setMode(found.length ? "text" : "check");
      setFields(found);
      const pages = await renderPages(data.slice(0));
      const extra =
        pages > 40
          ? " Solo se muestran las primeras 40 páginas; el PDF descargado lleva todas."
          : "";
      setNotice(
        (found.length
          ? `PDF con ${found.length} campo${found.length === 1 ? "" : "s"} del formulario. Rellénalos a la izquierda, o pulsa en la hoja y escribe encima.`
          : "Este PDF no trae casillas interactivas (pasa con Hacienda). Elige ✓ y pulsa en cada recuadro. Arrastra si no cae en el sitio.") +
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

  async function takeFile(file: File | undefined) {
    if (!file) return;
    if (!isPdfFile(file)) {
      setError("Sube un archivo PDF.");
      return;
    }
    const data = await file.arrayBuffer();
    await openBytes(data, file.name);
  }

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    await takeFile(file);
  }

  async function openBlank() {
    const data = await createBlankSheet();
    await openBytes(data, "documento-para-firmar.pdf");
  }

  function onDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragging(true);
  }

  function onDragLeave(event: React.DragEvent) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDragging(false);
  }

  async function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = [...event.dataTransfer.files].find(isPdfFile);
    if (!file) {
      setError("Suelta un archivo PDF.");
      return;
    }
    await takeFile(file);
  }

  function stampFromTyping(current: Typing): PdfStamp {
    const size = sizes[current.pageIndex];
    const width = Math.min(
      size ? size.width - 24 : current.width,
      Math.max(72, current.text.trim().length * 6.2),
    );
    return {
      id: newId(),
      pageIndex: current.pageIndex,
      kind: "text",
      x: current.x,
      y: current.y,
      width,
      height: current.height,
      text: current.text.trim(),
      imageDataUrl: "",
      fontSize: TEXT_SIZE[markSize],
    };
  }

  function flushTyping() {
    const current = typingRef.current;
    typingRef.current = null;
    setTyping(null);
    if (!current?.text.trim()) return stamps;
    const extra = stampFromTyping(current);
    const next = [...stamps, extra];
    setStamps(next);
    return next;
  }

  function placeStamp(
    pageIndex: number,
    point: { x: number; y: number },
    size: PageSize,
  ) {
    if (typing) {
      flushTyping();
    }
    if (mode === "check" || mode === "cross") {
      setError("");
      const box = markBox(markSize);
      setStamps((current) => [
        ...current,
        {
          id: newId(),
          pageIndex,
          kind: mode,
          x: Math.min(size.width - box.width, Math.max(0, point.x - box.width / 2)),
          y: Math.min(size.height - box.height, Math.max(0, point.y - box.height / 2)),
          width: box.width,
          height: box.height,
          text: "",
          imageDataUrl: "",
          fontSize: 0,
        },
      ]);
      return;
    }
    if (mode === "sign") {
      if (!signature) {
        setError("Dibuja la firma a la izquierda y luego pulsa en el PDF.");
        return;
      }
      setError("");
      const width = 132;
      const height = 52;
      setStamps((current) => [
        ...current,
        {
          id: newId(),
          pageIndex,
          kind: "signature",
          x: Math.min(point.x, size.width - width),
          y: Math.max(8, point.y - height / 2),
          width,
          height,
          text: "",
          imageDataUrl: signature,
          fontSize: 0,
        },
      ]);
      return;
    }
    if (mode === "date") {
      setError("");
      const text = formatPdfDate();
      const fontSize = TEXT_SIZE[markSize];
      const width = Math.min(size.width - 24, Math.max(72, text.length * fontSize * 0.56));
      setStamps((current) => [
        ...current,
        {
          id: newId(),
          pageIndex,
          kind: "date",
          x: Math.min(point.x, size.width - 12),
          y: Math.min(point.y, size.height - 12),
          width,
          height: fontSize + 3,
          text,
          imageDataUrl: "",
          fontSize,
        },
      ]);
      return;
    }
    setError("");
    const fontSize = TEXT_SIZE[markSize];
    if (textValue.trim()) {
      const text = textValue.trim();
      const width = Math.min(size.width - 24, Math.max(72, text.length * fontSize * 0.56));
      setStamps((current) => [
        ...current,
        {
          id: newId(),
          pageIndex,
          kind: "text",
          x: Math.min(point.x, size.width - 12),
          y: Math.min(point.y, size.height - 12),
          width,
          height: fontSize + 3,
          text,
          imageDataUrl: "",
          fontSize,
        },
      ]);
      return;
    }
    const next = {
      pageIndex,
      x: Math.min(point.x, size.width - 80),
      y: Math.min(point.y, size.height - 16),
      width: Math.min(240, Math.max(120, size.width - point.x - 16)),
      height: fontSize + 4,
      text: "",
    };
    typingRef.current = next;
    setTyping(next);
  }

  function undoStamp() {
    setTyping(null);
    setStamps((current) => current.slice(0, -1));
  }

  async function download() {
    if (!pdfBytes.current) {
      setError("Sube un PDF o crea una hoja en blanco.");
      return;
    }
    const nextStamps = flushTyping();
    setBusy(true);
    setError("");
    try {
      const bytes = await exportSignedPdf({
        data: pdfBytes.current.slice(0),
        fields,
        stamps: nextStamps,
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

  const filePicker = (
    <input
      ref={fileInput}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      onChange={(event) => void onFile(event)}
    />
  );

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl">
        {filePicker}
        <button
          type="button"
          disabled={busy}
          onClick={() => fileInput.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={(event) => void onDrop(event)}
          className={`flex w-full flex-col items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors sm:py-16 ${
            dragging
              ? "border-primary bg-primary/10"
              : "border-foreground/20 bg-card hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          <FileUp className="size-10 text-primary" />
          <p className="mt-4 font-heading text-2xl sm:text-3xl">
            {busy ? "Abriendo el PDF…" : "Sube tu PDF"}
          </p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {busy
              ? "Se abre en este ordenador. Un archivo grande tarda un momento."
              : "Arrástralo aquí o elige el que te han mandado. Rellenas, firmas y te lo descargas. No se envía a ningún servidor."}
          </p>
          {!busy ? (
            <span className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground">
              Elegir PDF del ordenador
            </span>
          ) : null}
        </button>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes archivo?{" "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => void openBlank()}
            disabled={busy}
          >
            Empezar con una hoja en blanco
          </button>
        </p>
        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {filePicker}
      <div className="no-print flex flex-col gap-6">
        <section
          className={`rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6 ${
            dragging ? "ring-2 ring-primary" : ""
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={(event) => void onDrop(event)}
        >
          <h2 className="font-heading text-2xl">Tu PDF</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {fileName}
            {pageCount
              ? ` · ${pageCount} página${pageCount === 1 ? "" : "s"}`
              : ""}
            . Sigue en este navegador.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              <FileUp />
              Cambiar de PDF
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
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Herramientas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            En un modelo 145 y similares: ✓ en cada casilla, texto donde pida
            datos, firma al final. Arrastra una marca si no cae en el recuadro.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mode === "check" ? "default" : "outline"}
              onClick={() => setMode("check")}
            >
              <Check />
              Casilla ✓
            </Button>
            <Button
              type="button"
              variant={mode === "cross" ? "default" : "outline"}
              onClick={() => setMode("cross")}
            >
              <X />
              Cruz
            </Button>
            <Button
              type="button"
              variant={mode === "text" ? "default" : "outline"}
              onClick={() => setMode("text")}
            >
              <Type />
              Escribir
            </Button>
            <Button
              type="button"
              variant={mode === "date" ? "default" : "outline"}
              onClick={() => setMode("date")}
            >
              Fecha
            </Button>
            <Button
              type="button"
              variant={mode === "sign" ? "default" : "outline"}
              onClick={() => setMode("sign")}
            >
              <PenLine />
              Firma
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Tamaño</span>
            {(["S", "M", "L"] as MarkSize[]).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={markSize === value ? "default" : "outline"}
                onClick={() => setMarkSize(value)}
              >
                {value}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-sm text-primary">
            {mode === "check"
              ? "Pulsa en cada recuadro para marcar ✓. En Hacienda usa tamaño S o M."
              : mode === "cross"
                ? "Pulsa para poner una X."
                : mode === "sign"
                  ? "Dibuja la firma y pulsa en el PDF."
                  : mode === "date"
                    ? "Pulsa en el PDF para poner la fecha de hoy."
                    : textValue.trim()
                      ? "Pulsa en el PDF para pegar ese texto."
                      : "Pulsa en el PDF y escribe ahí mismo."}
          </p>
          {mode === "text" ? (
            <div className="mt-3 grid gap-1.5">
              <Label htmlFor="pdf-text">Texto para repetir (opcional)</Label>
              <Input
                id="pdf-text"
                className="h-10"
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder="NIF, población… cada clic lo pega"
              />
            </div>
          ) : null}
          <div className="mt-4">
            <Label htmlFor="pdf-sign">
              Firma (dibuja con el dedo o el ratón)
            </Label>
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
              Este archivo ya traía cajas (Hacienda, banco, colegio…).
              Rellénalas aquí; salen en el PDF descargado.
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
            disabled={busy}
          >
            {busy ? "Preparando…" : <Download />}
            {busy ? "" : "Descargar PDF rellenado"}
          </Button>
          {stamps.length > 0 ? (
            <>
              <Button type="button" variant="ghost" onClick={undoStamp}>
                <Undo2 />
                Deshacer
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setTyping(null);
                  setStamps([]);
                }}
              >
                <Trash2 />
                Quitar marcas
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
        {busy && previews.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
            <p className="font-heading text-2xl">Abriendo el PDF…</p>
          </div>
        ) : (
          <ol className="flex flex-col gap-6">
            {previews.map((src, pageIndex) => {
              const size = sizes[pageIndex];
              if (!size) return null;
              const pageStamps = stamps.filter(
                (stamp) => stamp.pageIndex === pageIndex,
              );
              const pageTyping =
                typing && typing.pageIndex === pageIndex ? typing : null;
              return (
                <li key={pageIndex}>
                  <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                    Página {pageIndex + 1}
                  </p>
                  <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Página ${pageIndex + 1} del PDF`}
                      className="block w-full cursor-crosshair select-none"
                      draggable={false}
                      onClick={(event) => {
                        placeStamp(
                          pageIndex,
                          clickToPdfPoint(
                            event,
                            event.currentTarget,
                            size.width,
                            size.height,
                          ),
                          size,
                        );
                      }}
                    />
                    {pageStamps.map((stamp) => (
                      <div
                        key={stamp.id}
                        className="absolute z-10 cursor-grab touch-none"
                        style={{
                          left: `${(stamp.x / size.width) * 100}%`,
                          top: `${((size.height - stamp.y - stamp.height) / size.height) * 100}%`,
                          width: `${(stamp.width / size.width) * 100}%`,
                          height: `${(stamp.height / size.height) * 100}%`,
                        }}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          const image = (
                            event.currentTarget.parentElement as HTMLElement
                          ).querySelector("img");
                          if (!(image instanceof HTMLImageElement)) return;
                          const start = clickToPdfPoint(
                            event,
                            image,
                            size.width,
                            size.height,
                          );
                          drag.current = {
                            id: stamp.id,
                            originX: stamp.x,
                            originY: stamp.y,
                            startX: start.x,
                            startY: start.y,
                            moved: false,
                          };
                          event.currentTarget.setPointerCapture(event.pointerId);
                        }}
                        onPointerMove={(event) => {
                          if (!drag.current || drag.current.id !== stamp.id) {
                            return;
                          }
                          const image = (
                            event.currentTarget.parentElement as HTMLElement
                          ).querySelector("img");
                          if (!(image instanceof HTMLImageElement)) return;
                          const now = clickToPdfPoint(
                            event,
                            image,
                            size.width,
                            size.height,
                          );
                          const dx = now.x - drag.current.startX;
                          const dy = now.y - drag.current.startY;
                          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                            drag.current.moved = true;
                          }
                          const nextX = drag.current.originX + dx;
                          const nextY = drag.current.originY + dy;
                          setStamps((current) =>
                            current.map((item) =>
                              item.id === stamp.id
                                ? { ...item, x: nextX, y: nextY }
                                : item,
                            ),
                          );
                        }}
                        onPointerUp={() => {
                          drag.current = null;
                        }}
                      >
                        {stamp.kind === "signature" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={stamp.imageDataUrl}
                            alt="Firma"
                            className="size-full object-contain"
                            draggable={false}
                          />
                        ) : stamp.kind === "check" ? (
                          <span className="flex size-full items-center justify-center text-[11px] leading-none text-foreground">
                            ✓
                          </span>
                        ) : stamp.kind === "cross" ? (
                          <span className="flex size-full items-center justify-center text-[11px] leading-none text-foreground">
                            ×
                          </span>
                        ) : (
                          <span className="block px-0.5 text-left leading-tight text-foreground"
                            style={{ fontSize: `${stamp.fontSize || 11}px` }}
                          >
                            {stamp.text}
                          </span>
                        )}
                        <button
                          type="button"
                          className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] leading-none text-background"
                          aria-label="Quitar marca"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            setStamps((current) =>
                              current.filter((item) => item.id !== stamp.id),
                            );
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {pageTyping ? (
                      <input
                        ref={typingInput}
                        value={pageTyping.text}
                        aria-label="Escribir en el PDF"
                        className="absolute z-20 rounded-sm border border-primary bg-white px-1 text-[12px] leading-4 text-foreground shadow-sm outline-none"
                        style={{
                          left: `${(pageTyping.x / size.width) * 100}%`,
                          top: `${((size.height - pageTyping.y - pageTyping.height) / size.height) * 100}%`,
                          width: `${(pageTyping.width / size.width) * 100}%`,
                          height: `${(pageTyping.height / size.height) * 100}%`,
                          minHeight: "1.1rem",
                        }}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => {
                          const text = event.target.value;
                          setTyping((current) => {
                            if (!current) return current;
                            const next = { ...current, text };
                            typingRef.current = next;
                            return next;
                          });
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            flushTyping();
                          }
                          if (event.key === "Escape") {
                            event.preventDefault();
                            setTyping(null);
                          }
                        }}
                        onBlur={() => flushTyping()}
                      />
                    ) : null}
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
