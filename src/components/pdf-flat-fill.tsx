"use client";

/**
 * Relleno de PDF plano (sin AcroForm): detecta líneas, casillas y cajas
 * vectoriales y deja escribir encima con snap a la zona. Exporta con
 * exportSignedPdf pintando texto/marcas encima del PDF original.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eraser,
  FileUp,
  Minus,
  PenLine,
  Plus,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import {
  exportSignedPdf,
  suggestedFillFileName,
  type PdfStamp,
} from "@/lib/pdf-fill";
import {
  detectFlatZonesOnPage,
  segmentsFromOps,
  textItemsFromContent,
  type FlatZone,
} from "@/lib/pdf-form-detect";
import { newId } from "@/lib/quotes";
import { noticeForSave, saveBlob } from "@/lib/save-file";

type PageSize = { width: number; height: number };
type Mode = "fields" | "text" | "sign";

const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.4;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 20) / 20));
}

function dataUrlFromCanvas(canvas: HTMLCanvasElement) {
  const blank = document.createElement("canvas");
  blank.width = canvas.width;
  blank.height = canvas.height;
  if (canvas.toDataURL() === blank.toDataURL()) return "";
  return canvas.toDataURL("image/png");
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-full p-[10%]" aria-hidden>
      <path
        d="M2.5 8.2 6.2 12.2 13.5 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PdfFlatFill({
  data,
  name,
  locale = "es",
  beforeRun,
  afterRun,
  onChangeFile,
}: {
  data: ArrayBuffer;
  name: string;
  locale?: "es" | "en";
  beforeRun?: () => boolean;
  afterRun?: () => void;
  onChangeFile: (file: File) => void;
}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);

  const signCanvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef(new Map<string, HTMLInputElement | null>());

  const [fileName, setFileName] = useState(name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [zones, setZones] = useState<FlatZone[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [stamps, setStamps] = useState<PdfStamp[]>([]);
  const [signature, setSignature] = useState("");
  const [mode, setMode] = useState<Mode>("fields");
  const [zoom, setZoom] = useState(1);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [textValue, setTextValue] = useState("");
  const [detecting, setDetecting] = useState(false);
  const dataRef = useRef<ArrayBuffer | null>(null);

  const zonesByPage = useMemo(() => {
    const map = new Map<number, FlatZone[]>();
    for (const zone of zones) {
      const list = map.get(zone.pageIndex) ?? [];
      list.push(zone);
      map.set(zone.pageIndex, list);
    }
    return map;
  }, [zones]);

  const fieldZones = useMemo(
    () => zones.filter((z) => z.kind !== "check"),
    [zones],
  );

  // -- signature pad -------------------------------------------------------
  useEffect(() => {
    if (mode !== "sign") return;
    const pad = signCanvas.current;
    const ink = pad?.getContext("2d") ?? null;
    if (!pad || !ink) return;
    ink.lineWidth = 2.2;
    ink.lineCap = "round";
    ink.strokeStyle = "#1f1812";
    function point(event: PointerEvent) {
      const rect = pad!.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * pad!.width,
        y: ((event.clientY - rect.top) / rect.height) * pad!.height,
      };
    }
    function down(event: PointerEvent) {
      event.preventDefault();
      drawing.current = true;
      pad!.setPointerCapture(event.pointerId);
      const { x, y } = point(event);
      ink!.beginPath();
      ink!.moveTo(x, y);
    }
    function move(event: PointerEvent) {
      if (!drawing.current) return;
      const { x, y } = point(event);
      ink!.lineTo(x, y);
      ink!.stroke();
    }
    function up() {
      if (!drawing.current) return;
      drawing.current = false;
      setSignature(dataUrlFromCanvas(pad!));
    }
    pad.addEventListener("pointerdown", down);
    pad.addEventListener("pointermove", move);
    pad.addEventListener("pointerup", up);
    pad.addEventListener("pointerleave", up);
    return () => {
      pad.removeEventListener("pointerdown", down);
      pad.removeEventListener("pointermove", move);
      pad.removeEventListener("pointerup", up);
      pad.removeEventListener("pointerleave", up);
    };
  }, [mode]);

  // -- open / render --------------------------------------------------------
  const loadDocument = useCallback(
    async (data: ArrayBuffer) => {
      const pdfjs = await loadPdfjs();
      const task = pdfjs.getDocument({
        data: new Uint8Array(data.slice(0)),
        useWasm: false,
      });
      const pdf = await task.promise;
      const nextSizes: PageSize[] = [];
      const nextPreviews: string[] = [];
      const nextZones: FlatZone[] = [];
      const max = Math.min(pdf.numPages, 40);
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
        try {
          const [ops, text] = await Promise.all([
            page.getOperatorList(),
            page.getTextContent(),
          ]);
          const { segments, rects } = segmentsFromOps(
            ops.fnArray,
            ops.argsArray as unknown[],
            pdfjs.OPS,
          );
          nextZones.push(
            ...detectFlatZonesOnPage({
              segments,
              rects,
              texts: textItemsFromContent(text),
              pageIndex: number - 1,
              pageWidth: base.width,
              pageHeight: base.height,
            }),
          );
        } catch {
          // Página sin datos vectoriales (escaneo): queda sin zonas.
        }
      }
      await pdf.cleanup();
      await task.destroy();
      return { nextSizes, nextPreviews, nextZones, pageCount: pdf.numPages };
    },
    [],
  );

  const init = useCallback(
    async (source: ArrayBuffer, sourceName: string) => {
      setDetecting(true);
      setError("");
      setNotice("");
      setValues({});
      setChecks(new Set());
      setStamps([]);
      setActiveZone(null);
      try {
        const { nextSizes, nextPreviews, nextZones, pageCount } =
          await loadDocument(source.slice(0));
        dataRef.current = source.slice(0);
        setFileName(sourceName);
        setSizes(nextSizes);
      setPreviews(nextPreviews);
      setZones(nextZones);
        setNotice(
          nextZones.length
            ? t(
                `${nextZones.length} zonas detectadas. Pulsa una caja para escribir, o rellena la lista de campos.`,
                `${nextZones.length} zones detected. Tap a box to type, or fill the field list.`,
              ) +
                (pageCount > 40
                  ? t(" (se muestran 40 páginas)", " (showing 40 pages)")
                  : "")
            : t(
                "No he detectado casillas (escaneo o PDF raro). Usa los modos Texto y Firma para marcar encima.",
                "No zones detected (scan or odd PDF). Use Text and Sign modes to mark on top.",
              ),
        );
      } catch (caught) {
        dataRef.current = null;
        setSizes([]);
        setPreviews([]);
        setZones([]);
        setError(
          caught instanceof Error
            ? caught.message
            : t("No se pudo abrir el PDF.", "Could not open the PDF."),
        );
      } finally {
        setDetecting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadDocument],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => void init(data, name), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // -- field handling --------------------------------------------------------
  function setValue(zone: FlatZone, text: string) {
    setValues((current) => ({ ...current, [zone.id]: text }));
  }

  function toggleCheck(zone: FlatZone) {
    setChecks((current) => {
      const next = new Set(current);
      if (next.has(zone.id)) next.delete(zone.id);
      else next.add(zone.id);
      return next;
    });
  }

  function focusZone(zone: FlatZone) {
    setActiveZone(zone.id);
    fieldRefs.current.get(zone.id)?.focus();
  }

  function nextZone(zone: FlatZone) {
    const index = fieldZones.findIndex((z) => z.id === zone.id);
    const next = fieldZones[index + 1];
    if (next) focusZone(next);
  }

  // -- stamps / free text / signature ---------------------------------------
  function clickPdf(
    pageIndex: number,
    point: { x: number; y: number },
    size: PageSize,
  ) {
    if (mode === "sign") {
      if (!signature) {
        setError(
          t(
            "Dibuja la firma en el recuadro y luego pulsa en el PDF.",
            "Draw the signature in the box, then tap the PDF.",
          ),
        );
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
    if (mode === "text") {
      const text = textValue.trim();
      if (!text) {
        setError(t("Escribe el texto en el campo de arriba.", "Type the text in the field above."));
        return;
      }
      setError("");
      const fontSize = 11;
      setStamps((current) => [
        ...current,
        {
          id: newId(),
          pageIndex,
          kind: "text",
          x: Math.min(point.x, size.width - 12),
          y: Math.min(point.y, size.height - 16),
          width: Math.min(size.width - 24, Math.max(72, text.length * fontSize * 0.56)),
          height: fontSize + 4,
          text,
          imageDataUrl: "",
          fontSize,
        },
      ]);
    }
  }

  function undoStamp() {
    setStamps((current) => current.slice(0, -1));
  }

  // -- export -----------------------------------------------------------------
  function buildStamps(): PdfStamp[] {
    const out: PdfStamp[] = [...stamps];
    for (const zone of zones) {
      if (zone.kind === "check") {
        if (checks.has(zone.id)) {
          out.push({
            id: `z-${zone.id}`,
            pageIndex: zone.pageIndex,
            kind: "check",
            x: zone.x,
            y: zone.y,
            width: zone.width,
            height: zone.height,
            text: "",
            imageDataUrl: "",
            fontSize: 0,
          });
        }
        continue;
      }
      const text = (values[zone.id] ?? "").trim();
      if (!text) continue;
      const fontSize = zone.kind === "area"
        ? Math.max(8, Math.min(11, zone.height * 0.7))
        : Math.max(8, Math.min(12, zone.height * 0.78));
      out.push({
        id: `z-${zone.id}`,
        pageIndex: zone.pageIndex,
        kind: "text",
        x: zone.x + 1.5,
        y: zone.y + Math.min(4, zone.height * 0.3),
        width: zone.width - 3,
        height: zone.height,
        text,
        imageDataUrl: "",
        fontSize,
      });
    }
    return out;
  }

  async function download() {
    const data = dataRef.current;
    if (!data) return;
    if (beforeRun && !beforeRun()) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await exportSignedPdf({
        data: data.slice(0),
        fields: [],
        stamps: buildStamps(),
      });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const result = await saveBlob(blob, suggestedFillFileName(fileName));
      setNotice(
        noticeForSave(
          result,
          t("Listo. El PDF lleva tu texto y tus marcas.", "Done. The PDF has your text and marks."),
          locale,
        ),
      );
      afterRun?.();
    } catch {
      setError(t("No se pudo guardar el PDF.", "Could not save the PDF."));
    } finally {
      setBusy(false);
    }
  }

  // -- keyboard ---------------------------------------------------------------
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoStamp();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // -- render -------------------------------------------------------------------
  const loaded = previews.length > 0;
  const done = Object.values(values).filter((v) => v.trim()).length;

  if (!loaded) {
    return (
      <div className="mx-auto grid max-w-2xl place-items-center gap-3 py-16 text-center">
        <p className="text-muted-foreground">
          {detecting
            ? t("Leyendo el PDF y buscando sus casillas…", "Reading the PDF and finding its boxes…")
            : t("Abriendo…", "Opening…")}
        </p>
        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="no-print sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-foreground/10 bg-background/95 p-2 backdrop-blur sm:p-3">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => fileInput.current?.click()}
        >
          <FileUp />
          {t("Cambiar", "Change")}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onChangeFile(file);
          }}
        />
        <Button
          type="button"
          variant={mode === "fields" ? "default" : "outline"}
          className="h-11"
          onClick={() => setMode("fields")}
        >
          <Type />
          {t("Campos", "Fields")}
        </Button>
        <Button
          type="button"
          variant={mode === "text" ? "default" : "outline"}
          className="h-11"
          onClick={() => setMode("text")}
        >
          <Type />
          {t("Texto libre", "Free text")}
        </Button>
        <Button
          type="button"
          variant={mode === "sign" ? "default" : "outline"}
          className="h-11"
          onClick={() => setMode("sign")}
        >
          <PenLine />
          {t("Firma", "Sign")}
        </Button>
        {mode === "text" ? (
          <Input
            className="h-11 w-40"
            placeholder={t("Texto a poner", "Text to place")}
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
          />
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="size-11"
          aria-label={t("Alejar", "Zoom out")}
          onClick={() => setZoom((c) => clampZoom(c - 0.15))}
        >
          <Minus />
        </Button>
        <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          type="button"
          variant="outline"
          className="size-11"
          aria-label={t("Acercar", "Zoom in")}
          onClick={() => setZoom((c) => clampZoom(c + 0.15))}
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="size-11"
          aria-label={t("Deshacer", "Undo")}
          onClick={undoStamp}
          disabled={stamps.length === 0}
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          className="ml-auto h-11"
          onClick={() => void download()}
          disabled={busy}
        >
          <Download />
          {busy ? t("Preparando…", "Preparing…") : t("Guardar PDF", "Save PDF")}
        </Button>
      </div>

      {mode === "sign" ? (
        <div className="no-print sticky top-[60px] z-10 mx-auto max-w-3xl bg-background/95 p-2 backdrop-blur">
          <div className="relative rounded-[2px] bg-card ring-1 ring-foreground/15">
            <canvas ref={signCanvas} width={560} height={140} className="h-[140px] w-full touch-none" />
            {!signature ? (
              <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                {t("Dibuja tu firma aquí y luego pulsa en el PDF", "Draw your signature here, then tap the PDF")}
              </p>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              className="absolute right-1 top-1 h-9"
              onClick={() => {
                const canvas = signCanvas.current;
                const ctx = canvas?.getContext("2d");
                if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                setSignature("");
              }}
            >
              <Eraser />
              {t("Limpiar", "Clear")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto mt-4 grid max-w-6xl gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="no-print order-2 lg:order-1">
          <div className="rounded-[2px] bg-card p-3 ring-1 ring-foreground/10">
            <p className="text-sm font-medium">
              {t("Campos detectados", "Detected fields")}
              {done ? ` · ${done}/${fieldZones.length}` : ""}
            </p>
            {fieldZones.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  "Sin zonas. Escribe con «Texto libre» y marca con la firma.",
                  "No zones. Write with «Free text» and mark with the signature.",
                )}
              </p>
            ) : (
              <div className="mt-3 grid max-h-[70vh] gap-2 overflow-y-auto pr-1">
                {fieldZones.map((zone, index) => (
                  <label
                    key={zone.id}
                    className={`grid gap-1 rounded-[2px] p-2 ring-1 ${
                      activeZone === zone.id
                        ? "bg-primary/10 ring-primary/40"
                        : "ring-foreground/10"
                    }`}
                  >
                    <span className="truncate text-xs text-muted-foreground">
                      {index + 1}. {zone.label || t(`Campo p${zone.pageIndex + 1}`, `Field p${zone.pageIndex + 1}`)}
                    </span>
                    <Input
                      ref={(node) => {
                        fieldRefs.current.set(zone.id, node);
                      }}
                      className="h-10"
                      value={values[zone.id] ?? ""}
                      onFocus={() => {
                        setActiveZone(zone.id);
                        document
                          .getElementById(`zone-${zone.id}`)
                          ?.scrollIntoView({ block: "center", behavior: "smooth" });
                      }}
                      onChange={(event) => setValue(zone, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          nextZone(zone);
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="order-1 grid gap-6 lg:order-2">
          {previews.map((preview, pageIndex) => {
            const size = sizes[pageIndex];
            if (!size) return null;
            const pageZones = zonesByPage.get(pageIndex) ?? [];
            return (
              <div key={pageIndex} className="relative mx-auto" style={{ width: size.width * zoom }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={t(`Página ${pageIndex + 1}`, `Page ${pageIndex + 1}`)}
                  className="block w-full ring-1 ring-foreground/15"
                  draggable={false}
                />
                <button
                  type="button"
                  aria-label={t("Colocar marca", "Place mark")}
                  className="absolute inset-0 cursor-crosshair"
                  style={{ pointerEvents: mode === "fields" ? "none" : "auto" }}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    clickPdf(
                      pageIndex,
                      {
                        x: ((event.clientX - rect.left) / rect.width) * size.width,
                        y:
                          size.height -
                          ((event.clientY - rect.top) / rect.height) * size.height,
                      },
                      size,
                    );
                  }}
                />
                {pageZones.map((zone) => {
                  const left = zone.x * zoom;
                  const top = (size.height - zone.y - zone.height) * zoom;
                  const w = zone.width * zoom;
                  const h = zone.height * zoom;
                  if (zone.kind === "check") {
                    const on = checks.has(zone.id);
                    return (
                      <button
                        key={zone.id}
                        id={`zone-${zone.id}`}
                        type="button"
                        title={zone.label}
                        aria-pressed={on}
                        className={`absolute rounded-[2px] transition-colors ${
                          on
                            ? "bg-primary/20 text-foreground ring-1 ring-primary/60"
                            : "bg-primary/10 ring-1 ring-primary/50 ring-dashed hover:bg-primary/20"
                        }`}
                        style={{ left, top, width: Math.max(w, 14), height: Math.max(h, 14) }}
                        onClick={() => toggleCheck(zone)}
                      >
                        {on ? <CheckGlyph /> : null}
                      </button>
                    );
                  }
                  const text = values[zone.id] ?? "";
                  return (
                    <button
                      key={zone.id}
                      id={`zone-${zone.id}`}
                      type="button"
                      title={zone.label}
                      className={`absolute flex items-end overflow-hidden rounded-[2px] px-0.5 text-left transition-colors ${
                        activeZone === zone.id || text
                          ? "bg-primary/15 ring-1 ring-primary/50"
                          : "bg-primary/10 ring-1 ring-dashed ring-primary/40 hover:bg-primary/20"
                      }`}
                      style={{
                        left,
                        top,
                        width: w,
                        height: Math.max(h, 12),
                        fontSize: Math.max(9, zone.height * 0.72) * zoom,
                        lineHeight: 1.15,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        color: "#12100e",
                      }}
                      onClick={() => focusZone(zone)}
                    >
                      <span className="truncate pb-px">{text}</span>
                    </button>
                  );
                })}
                {stamps
                  .filter((stamp) => stamp.pageIndex === pageIndex)
                  .map((stamp) => (
                    <div
                      key={stamp.id}
                      className="group absolute"
                      style={{
                        left: stamp.x * zoom,
                        top: (size.height - stamp.y - stamp.height) * zoom,
                        width: stamp.width * zoom,
                        height: stamp.height * zoom,
                      }}
                    >
                      {stamp.kind === "signature" && stamp.imageDataUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={stamp.imageDataUrl} alt="" className="size-full object-contain" draggable={false} />
                      ) : stamp.kind === "text" ? (
                        <span
                          className="block whitespace-pre-wrap"
                          style={{ fontSize: stamp.fontSize * zoom, lineHeight: 1.15 }}
                        >
                          {stamp.text}
                        </span>
                      ) : null}
                      <button
                        type="button"
                        aria-label={t("Quitar marca", "Remove mark")}
                        className="absolute -right-2 -top-2 hidden size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"
                        onClick={() =>
                          setStamps((current) => current.filter((s) => s.id !== stamp.id))
                        }
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                <span className="absolute right-1 top-1 rounded bg-foreground/70 px-1.5 py-0.5 text-[10px] text-background">
                  {pageIndex + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="no-print mx-auto mt-4 max-w-3xl text-sm text-muted-foreground">
        {fileName}
        {notice ? ` · ${notice}` : ""}
      </p>
      {error ? (
        <p className="no-print mx-auto mt-2 max-w-3xl rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
