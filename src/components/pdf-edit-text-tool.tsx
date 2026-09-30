"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bold,
  ChevronLeft,
  ChevronRight,
  Download,
  FileUp,
  Highlighter,
  Italic,
  LayoutList,
  ScanText,
  Shapes,
  Type,
  Underline,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { bytesLabel } from "@/lib/limits";
import {
  DEFAULT_TEXT_COLOR,
  applyTextEdits,
  createSampleArticle,
  createSampleScan,
  extractPdfText,
  lineIsDirty,
  suggestedEditName,
  type PdfTextLine,
} from "@/lib/pdf-edit-text";
import { ocrPdfPage } from "@/lib/pdf-ocr";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import { noticeForSave, saveBlob } from "@/lib/save-file";

const PRESET_COLORS = [
  "#1a1714",
  "#c81e1e",
  "#1d4ed8",
  "#15803d",
  "#a16207",
  "#ffffff",
];

function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

function fontLabel(hint: string) {
  return hint.replace(/^.*\+/, "").replace(/-\d+$/, "") || "La del PDF";
}

function familyCss(hint: string) {
  if (/helvetica|arial|sans/i.test(hint)) return "Helvetica, Arial, sans-serif";
  if (/tinos|times|serif|georgia/i.test(hint))
    return "Tinos, Times New Roman, serif";
  return "Tinos, Times New Roman, serif";
}

function patchLine(
  lines: PdfTextLine[],
  id: string,
  patch: Partial<PdfTextLine>,
) {
  return lines.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function PdfEditTextTool() {
  const { pro, limit, upgrade, beforeRun, afterRun } = useJobGuard();
  const search = useSearchParams();
  const demo = search.get("demo") === "1";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [source, setSource] = useState<ArrayBuffer | null>(null);
  const [lines, setLines] = useState<PdfTextLine[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [active, setActive] = useState<string | null>(null);
  const [viewScale, setViewScale] = useState(0.72);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [fontNames, setFontNames] = useState<string[]>([]);
  const [ocrStatus, setOcrStatus] = useState("");
  const [stylesOpen, setStylesOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);

  async function openBytes(data: ArrayBuffer, name: string) {
    if (data.byteLength > limit.pdfBytes) {
      throw new Error(
        pro
          ? `El PDF pesa más de ${bytesLabel(limit.pdfBytes)}.`
          : `Gratis son ${bytesLabel(limit.pdfBytes)}. Pro admite archivos más grandes.`,
      );
    }
    const found = await extractPdfText(data.slice(0));
    if (found.pageCount > limit.pdfPages) {
      throw new Error(
        pro
          ? `Este PDF tiene ${found.pageCount} páginas.`
          : `Gratis son ${limit.pdfPages} páginas. Este tiene ${found.pageCount}.`,
      );
    }
    setFileName(name);
    setPageIndex(0);
    setLines(found.lines);
    setPageCount(found.pageCount);
    setSource(data.slice(0));
    setActive(found.lines.find((line) => line.pageIndex === 0)?.id ?? null);
    setFontNames(found.fontNames);
    if (found.lines.length === 0) {
      setNotice(
        "Este PDF no trae texto seleccionable. Pulsa «Leer con OCR» en esta página.",
      );
    } else {
      const fonts =
        found.fontNames.length > 0
          ? ` Fuente: ${found.fontNames.slice(0, 3).join(", ")}.`
          : "";
      setNotice(
        `${found.lines.length} líneas.${fonts} Pulsa una frase para escribir. A la derecha, tamaño y color.`,
      );
    }
  }

  async function takeFile(file: File | undefined) {
    if (!file) return;
    if (!isPdfFile(file)) {
      setError("Sube un archivo PDF.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await openBytes(await file.arrayBuffer(), file.name);
    } catch (caught) {
      setSource(null);
      setLines([]);
      setError(
        caught instanceof Error ? caught.message : "No se pudo abrir el PDF.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function openSample() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await openBytes(await createSampleArticle(), "cartel-prueba.pdf");
    } catch (caught) {
      setSource(null);
      setLines([]);
      setError(
        caught instanceof Error ? caught.message : "No se pudo crear el ejemplo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function openScan() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await openBytes(await createSampleScan(), "escaneo-prueba.pdf");
    } catch (caught) {
      setSource(null);
      setLines([]);
      setError(
        caught instanceof Error ? caught.message : "No se pudo crear el escaneo.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function runOcr() {
    if (!source) return;
    setBusy(true);
    setError("");
    setOcrStatus("Cargando OCR…");
    try {
      const found = await ocrPdfPage(source.slice(0), pageIndex, (info) => {
        setOcrStatus(`${info.status} ${info.pct}%`);
      });
      if (found.length === 0) {
        setError(
          "El OCR no leyó letras en esta página. Prueba con más contraste o usa Firmar PDF y escribe encima.",
        );
        return;
      }
      setLines((current) => [
        ...current.filter((line) => line.pageIndex !== pageIndex),
        ...found,
      ]);
      setNotice(
        `OCR: ${found.length} líneas. Revísalas. Al guardar se escribe texto de verdad (Tinos).`,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo leer el escaneo. El motor OCR ocupa varios MB la primera vez.",
      );
    } finally {
      setOcrStatus("");
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!source) {
      if (search.get("ocr") === "1") void openScan();
      else if (demo) void openSample();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  useEffect(() => {
    if (!source) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [source]);

  useEffect(() => {
    if (!source) {
      setThumbs([]);
      return;
    }
    let gone = false;
    void (async () => {
      const pdfjs = await loadPdfjs();
      const task = pdfjs.getDocument({
        data: new Uint8Array(source.slice(0)),
        useWasm: false,
      });
      const pdf = await task.promise;
      const next: string[] = [];
      for (let number = 1; number <= pdf.numPages; number += 1) {
        if (gone) break;
        const page = await pdf.getPage(number);
        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({
          canvas,
          viewport,
          annotationMode: pdfjs.AnnotationMode.DISABLE,
        }).promise;
        next.push(canvas.toDataURL("image/jpeg", 0.7));
      }
      await task.destroy();
      if (!gone) setThumbs(next);
    })().catch(() => {
      if (!gone) setThumbs([]);
    });
    return () => {
      gone = true;
    };
  }, [source]);

  useEffect(() => {
    if (!source || !canvasRef.current || !wrapRef.current) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    let gone = false;
    void (async () => {
      const pdfjs = await loadPdfjs();
      const task = pdfjs.getDocument({
        data: new Uint8Array(source.slice(0)),
        useWasm: false,
      });
      const pdf = await task.promise;
      if (gone) {
        await task.destroy();
        return;
      }
      const page = await pdf.getPage(pageIndex + 1);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const css = page.getViewport({ scale: viewScale });
      const viewport = page.getViewport({ scale: viewScale * dpr });
      wrap.style.width = `${css.width}px`;
      wrap.style.height = `${css.height}px`;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${css.width}px`;
      canvas.style.height = `${css.height}px`;
      await page.render({
        canvas,
        viewport,
        annotationMode: pdfjs.AnnotationMode.DISABLE,
      }).promise;
      await task.destroy();
    })().catch((caught) => {
      if (!gone) {
        setError(
          caught instanceof Error ? caught.message : "No se pudo pintar la página.",
        );
      }
    });
    return () => {
      gone = true;
    };
  }, [source, pageIndex, viewScale]);

  async function download() {
    if (!source) return;
    if (!beforeRun()) return;
    setBusy(true);
    setError("");
    try {
      const result = await applyTextEdits(source, lines);
      const blob = new Blob([new Uint8Array(result.bytes)], {
        type: "application/pdf",
      });
      const saved = await saveBlob(blob, suggestedEditName(fileName));
      setNotice(
        noticeForSave(
          saved,
          result.usedEmbedded
            ? "Guardado con la fuente que venía en el PDF (TTF/OTF embebida)."
            : "Guardado. Este PDF no traía una TTF reutilizable; el texto nuevo va en Helvetica.",
        ),
      );
      afterRun();
    } catch {
      setError("No se pudo guardar. Prueba con otro PDF (sin contraseña).");
    } finally {
      setBusy(false);
    }
  }

  function closeStudio() {
    setSource(null);
    setLines([]);
    setActive(null);
    setThumbs([]);
    setError("");
    setNotice("");
  }

  const pageLines = lines.filter((line) => line.pageIndex === pageIndex);
  const dirty = lines.some(lineIsDirty);
  const selected = lines.find((line) => line.id === active) ?? null;
  const zoomPct = Math.round(viewScale * 100);

  if (!source) {
    return (
      <div className="mx-auto max-w-2xl">
        <FileDrop
          accept="application/pdf,.pdf"
          busy={busy}
          dropTitle="PDF con texto"
          tapTitle="Elige el PDF del teléfono"
          cta="Elegir PDF"
          hint="Si tiene texto seleccionable, se edita al momento. Si es un escaneo, luego pulsa «Leer con OCR»."
          busyHint="Leyendo el texto del PDF."
          onFiles={(list) => void takeFile(list[0])}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes un PDF a mano?
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            className="h-12"
            onClick={() => void openSample()}
            disabled={busy}
          >
            Probar ahora con un cartel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12"
            onClick={() => void openScan()}
            disabled={busy}
          >
            Probar un escaneo (OCR)
          </Button>
        </div>
        <FreeCapNote
          text={`Gratis: un PDF de ${bytesLabel(limit.pdfBytes)} y ${limit.jobsPerDay} tareas al día`}
        />
        {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const stylesPanel = (
    <TextStylePanel
      line={selected}
      onChange={(patch) => {
        if (!selected) return;
        setLines((current) => patchLine(current, selected.id, patch));
      }}
    />
  );

  const thumbsList = (
    <div className="flex flex-col gap-3 p-3">
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            setPageIndex(index);
            setPagesOpen(false);
          }}
          className={`overflow-hidden rounded-[2px] bg-white ring-2 transition ${
            index === pageIndex
              ? "ring-primary"
              : "ring-transparent hover:ring-foreground/20"
          }`}
        >
          {thumbs[index] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbs[index]}
              alt={`Página ${index + 1}`}
              className="block w-full"
            />
          ) : (
            <div className="flex aspect-[210/297] items-center justify-center text-xs text-muted-foreground">
              {index + 1}
            </div>
          )}
          <span className="block py-1 text-center text-[11px] text-muted-foreground">
            {index + 1}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div
      data-luna-studio
      className="fixed inset-x-0 top-14 z-[45] flex flex-col bg-[#e8e4dc] sm:top-16 bottom-0"
    >
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-foreground/10 bg-card sm:h-14">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 sm:px-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={closeStudio}
          aria-label="Cerrar editor"
        >
          <X />
        </Button>
        <div className="mr-1 hidden items-center rounded-full bg-muted p-0.5 sm:flex">
          <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold ring-1 ring-foreground/10">
            Editar texto
          </span>
        </div>
        <ToolTab icon={Type} label="Texto" active />
        <ToolTab
          icon={Highlighter}
          label="Anotar"
          href="/pdf/"
          hint="La rúbrica está en Firmar PDF"
        />
        <ToolTab
          icon={Shapes}
          label="Formas"
          hint="Aún no. El texto sí se cambia aquí."
        />
        <ToolTab
          icon={LayoutList}
          label="Campos"
          href="/rellenar-pdf/"
          hint="Casillas de formulario: Rellenar PDF"
        />
        <Separator orientation="vertical" className="mx-1 hidden h-8 sm:block" />
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => void runOcr()}
          disabled={busy}
        >
          <ScanText />
          <span className="hidden sm:inline">{ocrStatus || "Leer con OCR"}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "application/pdf,.pdf";
            input.onchange = () => void takeFile(input.files?.[0]);
            input.click();
          }}
          disabled={busy}
        >
          <FileUp />
          <span className="hidden sm:inline">Cambiar</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 lg:hidden"
          onClick={() => setPagesOpen(true)}
        >
          Páginas
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 xl:hidden"
          onClick={() => setStylesOpen(true)}
        >
          Estilos
        </Button>
        </div>
        <div className="shrink-0 pr-2 sm:pr-3">
          <Button
            type="button"
            className="h-11 min-w-[7.5rem] px-3 text-sm sm:h-12 sm:min-w-[12rem] sm:px-4 sm:text-base"
            onClick={() => void download()}
            disabled={busy || !dirty || lines.length === 0}
          >
            <Download />
            {busy ? "Preparando…" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-36 shrink-0 overflow-y-auto border-r border-foreground/10 bg-[#f3efe6] lg:block">
          {thumbsList}
        </aside>

        <section className="relative min-w-0 flex-1 overflow-auto">
          <p className="pointer-events-none absolute top-3 left-4 z-10 max-w-lg truncate text-xs text-foreground/50">
            {fileName}
            {lines.length ? ` · ${lines.length} líneas` : ""}
          </p>
          <div className="flex min-h-full items-start justify-center px-4 py-10 sm:px-10 sm:py-12">
            <div
              ref={wrapRef}
              className="luna-pdf-page relative bg-white shadow-[0_24px_60px_-20px_rgba(40,24,10,0.5)]"
            >
              <div className="pointer-events-none absolute inset-[4%] z-20 border border-dashed border-sky-500/70" />
              <canvas ref={canvasRef} className="block" />
              {pageLines.map((line) => {
                const on = active === line.id;
                const changed = lineIsDirty(line);
                const covering = on || changed;
                return (
                  <label
                    key={line.id}
                    className={`absolute cursor-text overflow-hidden ${
                      on
                        ? "z-30 ring-2 ring-sky-500"
                        : changed
                          ? "z-20 ring-1 ring-sky-400/70"
                          : "z-20 bg-[rgba(37,99,235,0.16)] hover:bg-[rgba(37,99,235,0.28)]"
                    }`}
                    style={{
                      left: `${line.leftPct * 100}%`,
                      top: `${line.topPct * 100}%`,
                      width: `${Math.max(line.widthPct, 0.04) * 100}%`,
                      height: `${Math.max(line.heightPct, 0.012) * 100}%`,
                      fontSize: `${line.fontSize * viewScale}px`,
                      fontFamily: familyCss(line.fontHint),
                      fontWeight: line.bold ? 700 : 400,
                      fontStyle: line.italic ? "italic" : "normal",
                      color: covering ? line.color : "transparent",
                      textDecoration: line.underline ? "underline" : "none",
                    }}
                  >
                    <span className="sr-only">Editar texto</span>
                    <textarea
                      value={line.text}
                      rows={1}
                      spellCheck={false}
                      className={`h-full w-full resize-none border-0 bg-transparent p-0 leading-none outline-none ${
                        covering ? "" : "caret-transparent"
                      }`}
                      onFocus={() => setActive(line.id)}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLines((current) =>
                          patchLine(current, line.id, { text: value }),
                        );
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-foreground/10 bg-card xl:block">
          {stylesPanel}
        </aside>
      </div>

      <div className="flex h-12 shrink-0 items-center justify-center gap-3 border-t border-foreground/10 bg-card px-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={pageIndex <= 0}
          onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-16 text-center text-sm tabular-nums">
          {pageIndex + 1} / {pageCount}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={pageIndex >= pageCount - 1}
          onClick={() =>
            setPageIndex((current) => Math.min(pageCount - 1, current + 1))
          }
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </Button>
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setViewScale((value) => Math.max(0.35, value - 0.1))}
          aria-label="Alejar"
        >
          <ZoomOut />
        </Button>
        <input
          type="range"
          min={35}
          max={160}
          value={zoomPct}
          onChange={(event) => setViewScale(Number(event.target.value) / 100)}
          className="hidden w-28 accent-primary sm:block"
          aria-label="Zoom"
        />
        <span className="w-12 text-sm tabular-nums text-muted-foreground">
          {zoomPct}%
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setViewScale((value) => Math.min(1.6, value + 0.1))}
          aria-label="Acercar"
        >
          <ZoomIn />
        </Button>
      </div>

      {error || notice || upgrade ? (
        <div className="shrink-0 space-y-1 border-t border-foreground/10 bg-card px-3 py-2 text-sm">
          {error ? <p className="text-destructive">{error}</p> : null}
          {notice ? (
            <p className="text-muted-foreground">
              {notice}{" "}
              {lines.length === 0 ? (
                <Link
                  href="/pdf/"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Ir a Firmar PDF
                </Link>
              ) : fontNames.length ? (
                <span>Fuentes: {fontNames.slice(0, 4).join(", ")}.</span>
              ) : null}
            </p>
          ) : null}
          {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
        </div>
      ) : null}

      <Sheet open={pagesOpen} onOpenChange={setPagesOpen}>
        <SheetContent side="left" className="w-[min(16rem,90vw)] p-0">
          <SheetHeader className="p-3">
            <SheetTitle>Páginas</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">{thumbsList}</div>
        </SheetContent>
      </Sheet>
      <Sheet open={stylesOpen} onOpenChange={setStylesOpen}>
        <SheetContent side="right" className="w-[min(20rem,92vw)] p-0">
          <SheetHeader className="p-3">
            <SheetTitle>Estilos de texto</SheetTitle>
          </SheetHeader>
          {stylesPanel}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ToolTab({
  icon: Icon,
  label,
  active,
  href,
  hint,
}: {
  icon: typeof Type;
  label: string;
  active?: boolean;
  href?: string;
  hint?: string;
}) {
  const className = `h-10 gap-1.5 px-2.5 ${
    active ? "bg-muted text-foreground" : "text-muted-foreground"
  }`;
  if (href) {
    return (
      <Button
        variant="ghost"
        className={className}
        title={hint}
        render={<Link href={href} />}
        nativeButton={false}
      >
        <Icon />
        <span className="hidden md:inline">{label}</span>
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      title={hint}
      disabled={!active}
    >
      <Icon />
      <span className="hidden md:inline">{label}</span>
    </Button>
  );
}

function TextStylePanel({
  line,
  onChange,
}: {
  line: PdfTextLine | null;
  onChange: (patch: Partial<PdfTextLine>) => void;
}) {
  if (!line) {
    return (
      <div className="p-4">
        <h2 className="font-heading text-lg">Estilos de texto</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pulsa una frase azulada en la página. Aquí cambias tamaño, negrita y
          color. La cursiva solo se guarda si pasas a Helvetica: la TTF del PDF
          suele venir en un solo corte.
        </p>
      </div>
    );
  }
  const embedded = !/helvetica|arial|sans/i.test(line.fontHint);
  const family = /helvetica|arial|sans/i.test(line.fontHint)
    ? "helvetica"
    : /tinos/i.test(line.fontHint)
      ? "tinos"
      : "embedded";
  return (
    <div className="p-4">
      <h2 className="font-heading text-lg">Estilos de texto</h2>
      <label className="mt-4 block text-xs font-medium text-muted-foreground">
        Fuente
      </label>
      <select
        className="mt-1 h-10 w-full rounded-[2px] border border-input bg-background px-2 text-sm"
        value={family}
        onChange={(event) => {
          const value = event.target.value;
          onChange({
            fontHint:
              value === "helvetica"
                ? "Helvetica"
                : value === "tinos"
                  ? "Tinos-Regular"
                  : line.originalFontHint,
            italic: value === "helvetica" ? line.italic : false,
          });
        }}
      >
        <option value="embedded">
          Del PDF ({fontLabel(line.originalFontHint)})
        </option>
        <option value="tinos">Tinos</option>
        <option value="helvetica">Helvetica</option>
      </select>
      <div className="mt-3 flex items-center gap-2">
        <Input
          type="number"
          min={8}
          max={64}
          className="h-10 w-20 rounded-[2px]"
          value={Math.round(line.fontSize)}
          onChange={(event) =>
            onChange({
              fontSize: Math.max(
                8,
                Math.min(64, Number(event.target.value) || line.fontSize),
              ),
            })
          }
        />
        <span className="text-sm text-muted-foreground">pt</span>
      </div>
      <div className="mt-3 flex gap-1">
        <Button
          type="button"
          variant={line.bold ? "secondary" : "outline"}
          size="icon"
          className="size-10"
          onClick={() => onChange({ bold: !line.bold })}
          aria-pressed={line.bold}
          title="Negrita"
        >
          <Bold />
        </Button>
        <Button
          type="button"
          variant={line.italic ? "secondary" : "outline"}
          size="icon"
          className="size-10"
          disabled={embedded}
          title={
            embedded
              ? "Cursiva: elige Helvetica. La fuente embebida no trae itálica."
              : "Cursiva"
          }
          onClick={() => onChange({ italic: !line.italic })}
          aria-pressed={!!line.italic}
        >
          <Italic />
        </Button>
        <Button
          type="button"
          variant={line.underline ? "secondary" : "outline"}
          size="icon"
          className="size-10"
          onClick={() => onChange({ underline: !line.underline })}
          aria-pressed={!!line.underline}
          title="Subrayado"
        >
          <Underline />
        </Button>
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">
        Color actual
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`size-7 rounded-full ring-1 ring-foreground/20 ${
              line.color.toLowerCase() === color ? "ring-2 ring-primary" : ""
            }`}
            style={{ background: color }}
            aria-label={`Color ${color}`}
            onClick={() => onChange({ color })}
          />
        ))}
        <input
          type="color"
          value={line.color}
          onChange={(event) => onChange({ color: event.target.value })}
          className="size-8 cursor-pointer rounded-[2px] border border-input bg-card p-0"
          aria-label="Color personalizado"
        />
      </div>
    </div>
  );
}
