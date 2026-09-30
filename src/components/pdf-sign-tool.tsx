"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  Download,
  Eraser,
  FileUp,
  Minus,
  PenLine,
  Plus,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { noticeForSave, saveBlob } from "@/lib/save-file";
import { bytesLabel } from "@/lib/limits";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import {
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

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.5;

function clampZoom(value: number) {
  const rounded = Math.round(value * 20) / 20;
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, rounded));
}

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

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-full p-[8%]" aria-hidden>
      <path
        d="M2.5 8.2 6.2 12.2 13.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-full p-[12%]" aria-hidden>
      <path
        d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PdfSignTool() {
  const { pro, limit, upgrade, setUpgrade, beforeRun, afterRun } = useJobGuard();
  const fileInput = useRef<HTMLInputElement>(null);
  const signCanvas = useRef<HTMLCanvasElement>(null);
  const typingInput = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
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
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [typing, setTyping] = useState<Typing | null>(null);
  const typingRef = useRef<Typing | null>(null);
  const stampsRef = useRef<PdfStamp[]>([]);
  const selectedRef = useRef<string | null>(null);
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

  useEffect(() => {
    stampsRef.current = stamps;
  }, [stamps]);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

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
        event.preventDefault();
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
    const node = previewRef.current;
    if (!node) return;
    function onWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      setZoom((current) =>
        clampZoom(current + (event.deltaY < 0 ? 0.1 : -0.1)),
      );
    }
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [loaded]);

  const renderPages = useCallback(async (data: ArrayBuffer) => {
    const pdfjs = await loadPdfjs();
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
    setSelectedId(null);
    try {
      if (data.byteLength > limit.pdfBytes) {
        throw new Error(
          pro
            ? `El PDF pesa más de ${bytesLabel(limit.pdfBytes)}.`
            : `Gratis son ${bytesLabel(limit.pdfBytes)}. Pro admite archivos más grandes.`,
        );
      }
      pdfBytes.current = data.slice(0);
      setLoaded(true);
      setFileName(name);
      setStamps([]);
      const found = await listPdfFields(data.slice(0));
      const flat = found.length === 0;
      setMode(flat ? "check" : "text");
      setMarkSize(flat ? "S" : "M");
      setZoom(flat ? 1.35 : 1.1);
      setFields(found);
      const pages = await renderPages(data.slice(0));
      const extra =
        pages > 40
          ? " Solo se muestran las primeras 40 páginas; el PDF descargado lleva todas."
          : "";
      setNotice(
        (found.length
          ? `PDF con ${found.length} campo${found.length === 1 ? "" : "s"} reales del formulario. Rellénalos a la izquierda (no es texto pintado encima). Si quieres solo eso, usa Rellenar PDF.`
          : "Este PDF no trae campos. Un escaneo o un PDF ‘impreso’ no se puede convertir en formulario de verdad. Aquí marcas encima; para campos originales usa un PDF hecho con casillas (Word, Acrobat, Hacienda).") +
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
    if (!current?.text.trim()) return stampsRef.current;
    const extra = stampFromTyping(current);
    const next = [...stampsRef.current, extra];
    stampsRef.current = next;
    setStamps(next);
    setSelectedId(extra.id);
    return next;
  }

  function applyMarkSize(value: MarkSize) {
    setMarkSize(value);
    const id = selectedRef.current;
    if (!id) return;
    setStamps((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        if (item.kind === "check" || item.kind === "cross") {
          const box = markBox(value);
          return { ...item, width: box.width, height: box.height };
        }
        if (item.kind === "text" || item.kind === "date") {
          const fontSize = TEXT_SIZE[value];
          return { ...item, fontSize, height: fontSize + 3 };
        }
        return item;
      }),
    );
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
      const id = newId();
      setStamps((current) => [
        ...current,
        {
          id,
          pageIndex,
          kind: mode,
          x: Math.min(size.width - box.width, Math.max(0, point.x - box.width / 2)),
          y: Math.min(
            size.height - box.height,
            Math.max(0, point.y - box.height / 2),
          ),
          width: box.width,
          height: box.height,
          text: "",
          imageDataUrl: "",
          fontSize: 0,
        },
      ]);
      setSelectedId(id);
      return;
    }
    if (mode === "sign") {
      if (!signature) {
        setError("Dibuja la firma en el recuadro y luego pulsa en el PDF.");
        return;
      }
      setError("");
      const width = 132;
      const height = 52;
      const id = newId();
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
          fontSize: 0,
        },
      ]);
      setSelectedId(id);
      return;
    }
    if (mode === "date") {
      setError("");
      const text = formatPdfDate();
      const fontSize = TEXT_SIZE[markSize];
      const width = Math.min(
        size.width - 24,
        Math.max(72, text.length * fontSize * 0.56),
      );
      const id = newId();
      setStamps((current) => [
        ...current,
        {
          id,
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
      setSelectedId(id);
      return;
    }
    setError("");
    const fontSize = TEXT_SIZE[markSize];
    if (textValue.trim()) {
      const text = textValue.trim();
      const width = Math.min(
        size.width - 24,
        Math.max(72, text.length * fontSize * 0.56),
      );
      const id = newId();
      setStamps((current) => [
        ...current,
        {
          id,
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
      setSelectedId(id);
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
    setSelectedId(null);
    setTyping(next);
  }

  function undoStamp() {
    setTyping(null);
    const current = stampsRef.current;
    const next = current.slice(0, -1);
    stampsRef.current = next;
    setStamps(next);
    setSelectedId(next[next.length - 1]?.id ?? null);
  }

  function nudgeSelected(dx: number, dy: number) {
    const id = selectedRef.current;
    if (!id) return;
    setStamps((current) =>
      current.map((item) =>
        item.id === id ? { ...item, x: item.x + dx, y: item.y + dy } : item,
      ),
    );
  }

  useEffect(() => {
    if (!loaded) return;
    function onKey(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        setTyping(null);
        undoStamp();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && (event.key === "=" || event.key === "+")) {
        event.preventDefault();
        setZoom((current) => clampZoom(current + 0.1));
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        setZoom((current) => clampZoom(current - 0.1));
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "0") {
        event.preventDefault();
        setZoom(1);
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        const id = selectedRef.current;
        if (!id) {
          const current = stampsRef.current;
          const next = current.slice(0, -1);
          stampsRef.current = next;
          setTyping(null);
          setStamps(next);
          setSelectedId(next[next.length - 1]?.id ?? null);
          return;
        }
        const next = stampsRef.current.filter((item) => item.id !== id);
        stampsRef.current = next;
        setStamps(next);
        setSelectedId(next[next.length - 1]?.id ?? null);
        return;
      }
      const step = event.shiftKey ? 5 : 1;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgeSelected(-step, 0);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgeSelected(step, 0);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        nudgeSelected(0, step);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        nudgeSelected(0, -step);
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

  async function download() {
    if (!pdfBytes.current) {
      setError("Sube un PDF o crea una hoja en blanco.");
      return;
    }
    if (!beforeRun()) return;
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
      const result = await saveBlob(blob, suggestedFileName(fileName));
      setNotice(
        noticeForSave(result, "Listo. El PDF firmado está guardado."),
      );
      afterRun();
    } catch {
      setError("No se pudo guardar. Prueba con otro PDF (sin contraseña).");
    } finally {
      setBusy(false);
    }
  }

  const modeHint =
    mode === "check"
      ? "Pulsa en cada recuadro para marcar ✓. Amplía con + o Ctrl + rueda."
      : mode === "cross"
        ? "Pulsa para poner una X."
        : mode === "sign"
          ? "Dibuja la firma a la izquierda y pulsa en el PDF."
          : mode === "date"
            ? "Pulsa en el PDF para poner la fecha de hoy."
            : textValue.trim()
              ? "Pulsa en el PDF para pegar ese texto."
              : "Pulsa en el PDF y escribe ahí mismo.";

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
        <FileDrop
          accept="application/pdf,.pdf"
          busy={busy}
          dropTitle="Sube tu PDF"
          tapTitle="Elige el PDF del teléfono"
          cta="Elegir PDF"
          hint="El que te han mandado. Lo rellenas, lo firmas y te lo guardas. No se envía a ningún servidor."
          busyHint="Abriendo el PDF. Un archivo grande tarda un momento."
          onFiles={(list) => void takeFile(list[0])}
        />
        <FreeCapNote
          text={`Gratis: un PDF de ${bytesLabel(limit.pdfBytes)} y ${limit.jobsPerDay} tareas al día`}
        />
        {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes archivo?{" "}
          <button
            type="button"
            className="min-h-11 text-primary underline-offset-4 hover:underline"
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

  const modeButtons: { id: Mode; label: string; icon: ReactNode }[] = [
    { id: "check", label: "✓", icon: <Check className="size-4" /> },
    { id: "cross", label: "X", icon: <X className="size-4" /> },
    { id: "text", label: "Texto", icon: <Type className="size-4" /> },
    { id: "date", label: "Fecha", icon: null },
    { id: "sign", label: "Firma", icon: <PenLine className="size-4" /> },
  ];

  return (
    <div className="grid gap-4 pb-24 xl:pb-0">
      {filePicker}
      <div className="no-print sticky top-[5.5rem] z-30 rounded-[2px] bg-card/95 p-2 shadow-sm ring-1 ring-foreground/10 backdrop-blur-md sm:top-[6.25rem] sm:p-3">
        <div className="grid grid-cols-5 gap-1 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
          {modeButtons.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={mode === item.id ? "default" : "outline"}
              className="h-12 flex-col gap-0 px-1 text-[11px] sm:h-9 sm:flex-row sm:gap-1.5 sm:px-2.5 sm:text-sm"
              onClick={() => setMode(item.id)}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {(["S", "M", "L"] as MarkSize[]).map((value) => (
            <Button
              key={value}
              type="button"
              variant={markSize === value ? "default" : "outline"}
              className="h-11 min-w-11 sm:h-8"
              onClick={() => applyMarkSize(value)}
            >
              {value}
            </Button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <Button
            type="button"
            variant="outline"
            className="size-11 sm:size-8"
            aria-label="Alejar"
            onClick={() => setZoom((current) => clampZoom(current - 0.15))}
          >
            <Minus />
          </Button>
          <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="outline"
            className="size-11 sm:size-8"
            aria-label="Acercar"
            onClick={() => setZoom((current) => clampZoom(current + 0.15))}
          >
            <Plus />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 sm:h-8"
            onClick={() => setZoom(1)}
          >
            Caber
          </Button>
          <span className="ml-auto hidden flex-wrap gap-1.5 xl:flex">
            {stamps.length > 0 ? (
              <>
                <Button type="button" size="sm" variant="ghost" onClick={undoStamp}>
                  <Undo2 />
                  Deshacer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTyping(null);
                    setStamps([]);
                    setSelectedId(null);
                    stampsRef.current = [];
                  }}
                >
                  <Trash2 />
                  Quitar
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              size="sm"
              onClick={() => void download()}
              disabled={busy}
            >
              {busy ? "Preparando…" : <Download />}
              {busy ? "" : "Guardar PDF"}
            </Button>
          </span>
        </div>
        <p className="mt-2 px-1 text-xs text-muted-foreground sm:text-sm">
          {modeHint}
        </p>
        {previews.length > 1 ? (
          <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
            {previews.map((_, index) => (
              <button
                key={index}
                type="button"
                className="h-10 shrink-0 rounded-lg bg-muted px-3 text-sm"
                onClick={() =>
                  document
                    .getElementById(`pdf-page-${index}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Pág. {index + 1}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)]">
        <div className="no-print flex flex-col gap-4 xl:order-1">
          <section
            className={`rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5 ${
              dragging ? "ring-2 ring-primary" : ""
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(event) => void onDrop(event)}
          >
            <h2 className="font-heading text-xl">Tu PDF</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {fileName}
              {pageCount
                ? ` · ${pageCount} página${pageCount === 1 ? "" : "s"}`
                : ""}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button
                type="button"
                className="h-12"
                onClick={() => fileInput.current?.click()}
                disabled={busy}
              >
                <FileUp />
                Cambiar
              </Button>
              <Button
                type="button"
                className="h-12"
                variant="outline"
                onClick={() => void openBlank()}
                disabled={busy}
              >
                Hoja en blanco
              </Button>
            </div>
          </section>

          {mode === "text" ? (
            <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
              <Label htmlFor="pdf-text">Texto para repetir (opcional)</Label>
              <Input
                id="pdf-text"
                className="mt-2 h-12"
                value={textValue}
                onChange={(event) => setTextValue(event.target.value)}
                placeholder="NIF, población… cada clic lo pega"
              />
            </section>
          ) : null}

          <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
            <Label htmlFor="pdf-sign">Firma (dedo o ratón)</Label>
            <canvas
              id="pdf-sign"
              ref={signCanvas}
              width={640}
              height={200}
              className="mt-2 h-36 w-full touch-none rounded-xl border border-dashed border-foreground/20 bg-background sm:h-28"
            />
            <Button
              type="button"
              variant="ghost"
              className="mt-2 h-11"
              onClick={resetPad}
            >
              <Eraser />
              Borrar firma
            </Button>
          </section>

          {fields.length > 0 ? (
            <section className="rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
              <h2 className="font-heading text-xl">Campos del PDF</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Este archivo ya traía cajas. Rellénalas aquí; salen en el PDF
                descargado.
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
                    ) : field.kind === "choice" || field.kind === "radio" ? (
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
          <p className="hidden text-xs text-muted-foreground lg:block">
            Atajos: 1 ✓ · 2 X · 3 texto · F firma · Ctrl+Z deshacer ·
            flechas mover · Supr quitar · Ctrl+rueda ampliar.
          </p>
        </div>

        <div className="min-w-0 xl:order-2" ref={previewRef}>
          {busy && previews.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
              <p className="font-heading text-2xl">Abriendo el PDF…</p>
            </div>
          ) : (
            <div className="overflow-auto pb-8">
              <ol
                className="mx-auto flex flex-col gap-6"
                style={{ width: `${Math.round(zoom * 100)}%` }}
              >
                {previews.map((src, pageIndex) => {
                  const size = sizes[pageIndex];
                  if (!size) return null;
                  const pageStamps = stamps.filter(
                    (stamp) => stamp.pageIndex === pageIndex,
                  );
                  const pageTyping =
                    typing && typing.pageIndex === pageIndex ? typing : null;
                  return (
                    <li key={pageIndex} id={`pdf-page-${pageIndex}`}>
                      <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                        Página {pageIndex + 1}
                      </p>
                      <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`Página ${pageIndex + 1} del PDF`}
                          className="block w-full cursor-crosshair touch-manipulation select-none"
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
                            className={`absolute z-10 cursor-grab touch-none ${
                              selectedId === stamp.id
                                ? "ring-2 ring-primary ring-offset-1"
                                : ""
                            }`}
                            style={{
                              left: `${(stamp.x / size.width) * 100}%`,
                              top: `${((size.height - stamp.y - stamp.height) / size.height) * 100}%`,
                              width: `${(stamp.width / size.width) * 100}%`,
                              height: `${(stamp.height / size.height) * 100}%`,
                              containerType: "size",
                            }}
                            onPointerDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setSelectedId(stamp.id);
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
                              event.currentTarget.setPointerCapture(
                                event.pointerId,
                              );
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
                              <span className="block size-full text-foreground">
                                <CheckGlyph />
                              </span>
                            ) : stamp.kind === "cross" ? (
                              <span className="block size-full text-foreground">
                                <CrossGlyph />
                              </span>
                            ) : (
                              <span
                                className="block size-full overflow-hidden px-[2%] leading-none text-foreground"
                                style={{ fontSize: "80cqh" }}
                              >
                                {stamp.text}
                              </span>
                            )}
                            <button
                              type="button"
                              className="absolute -right-3 -top-3 flex size-8 items-center justify-center rounded-full bg-foreground text-base leading-none text-background"
                              aria-label="Quitar marca"
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.stopPropagation();
                                setStamps((current) =>
                                  current.filter((item) => item.id !== stamp.id),
                                );
                                setSelectedId((current) =>
                                  current === stamp.id ? null : current,
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
            </div>
          )}
        </div>
      </div>

      <div
        className="no-print fixed inset-x-0 z-40 border-t border-border/80 bg-background/95 p-3 backdrop-blur-md xl:hidden"
        style={{
          bottom: "calc(3.75rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          {stamps.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="h-12 shrink-0 px-4"
              onClick={undoStamp}
            >
              <Undo2 />
              Deshacer
            </Button>
          ) : null}
          <Button
            type="button"
            className="h-12 flex-1"
            onClick={() => void download()}
            disabled={busy}
          >
            {busy ? "Preparando…" : <Download />}
            {busy ? "" : "Guardar PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
