"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, FileUp, ScanText } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { bytesLabel } from "@/lib/limits";
import {
  applyTextEdits,
  createSampleArticle,
  createSampleScan,
  extractPdfText,
  suggestedEditName,
  type PdfTextLine,
} from "@/lib/pdf-edit-text";
import { ocrPdfPage } from "@/lib/pdf-ocr";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import { noticeForSave, saveBlob } from "@/lib/save-file";

function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
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
  const [scale, setScale] = useState(1);
  const [fontNames, setFontNames] = useState<string[]>([]);
  const [ocrStatus, setOcrStatus] = useState("");

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
    setActive(null);
    setFontNames(found.fontNames);
    if (found.lines.length === 0) {
      setNotice(
        "Este PDF no trae texto seleccionable (escaneo o página-foto). Puedes leer esta página con OCR en este navegador: el archivo no se sube; sí se carga un modelo de español. Es más lento y se equivoca más que iLove.",
      );
    } else {
      const fonts =
        found.fontNames.length > 0
          ? ` Fuente detectada: ${found.fontNames.slice(0, 3).join(", ")}.`
          : "";
      setNotice(
        `${found.lines.length} línea${found.lines.length === 1 ? "" : "s"} de texto.${fonts} Pulsa una y cambia el contenido. Al guardar se tapa el original y se reescribe con la fuente embebida si el PDF trae TTF/OTF; si no, Helvetica.`,
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
        caught instanceof Error
          ? caught.message
          : "No se pudo abrir el PDF.",
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
        `OCR: ${found.length} línea${found.length === 1 ? "" : "s"} en esta página. Revísalas: un escaneo se equivoca. Al guardar se tapa la foto en esas zonas y se escribe texto de verdad (Tinos).`,
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
      const viewport = page.getViewport({ scale: 1.15 });
      wrap.style.width = `${viewport.width}px`;
      wrap.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      setScale(viewport.scale);
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
  }, [source, pageIndex]);

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
            ? "Guardado con la fuente que venía en el PDF (TTF/OTF embebida). Si faltaban glifos, esa línea puede haber caído a Helvetica."
            : "Guardado. Este PDF no traía una fuente TTF reutilizable; el texto nuevo va en Helvetica.",
        ),
      );
      afterRun();
    } catch {
      setError("No se pudo guardar. Prueba con otro PDF (sin contraseña).");
    } finally {
      setBusy(false);
    }
  }

  const pageLines = lines.filter((line) => line.pageIndex === pageIndex);
  const dirty = lines.some((line) => line.text !== line.original);

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

  return (
    <div className="grid gap-4 pb-24">
      <div className="no-print flex flex-wrap items-center gap-2 rounded-[2px] bg-card/95 p-2 shadow-sm ring-1 ring-foreground/10 sm:p-3">
        <Button
          type="button"
          variant="outline"
          className="h-11"
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
          Cambiar
        </Button>
        {pageCount > 1 ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={pageIndex <= 0}
              onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {pageIndex + 1} / {pageCount}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={pageIndex >= pageCount - 1}
              onClick={() =>
                setPageIndex((current) => Math.min(pageCount - 1, current + 1))
              }
            >
              Siguiente
            </Button>
          </>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => void runOcr()}
          disabled={busy}
        >
          <ScanText />
          {ocrStatus || "Leer con OCR"}
        </Button>
        <Button
          type="button"
          className="ml-auto h-11"
          onClick={() => void download()}
          disabled={busy || !dirty || lines.length === 0}
        >
          <Download />
          {busy ? "Preparando…" : "Guardar PDF"}
        </Button>
      </div>

      <p className="no-print text-sm text-muted-foreground">
        {fileName}
        {lines.length ? ` · ${lines.length} líneas` : ""}
        . Pulsa una línea para escribir encima.
      </p>

      <div className="overflow-auto">
        <div
          ref={wrapRef}
          className="luna-pdf-page relative mx-auto bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10"
        >
          <canvas ref={canvasRef} className="block" />
          {pageLines.map((line) => {
            const selected = active === line.id;
            const changed = line.text !== line.original;
            const covering = selected || changed;
            return (
              <label
                key={line.id}
                className={`absolute cursor-text overflow-hidden ${
                  selected
                    ? "z-20 ring-2 ring-primary"
                    : changed
                      ? "z-10 ring-1 ring-primary/40"
                      : "z-10 bg-[rgba(0,90,255,0.14)] hover:bg-[rgba(0,90,255,0.24)]"
                }`}
                style={{
                  left: `${line.leftPct * 100}%`,
                  top: `${line.topPct * 100}%`,
                  width: `${Math.max(line.widthPct, 0.04) * 100}%`,
                  height: `${Math.max(line.heightPct, 0.012) * 100}%`,
                  fontSize: `${line.fontSize * scale}px`,
                  fontFamily: /tinos|times|serif/i.test(line.fontHint)
                    ? "Tinos, Times New Roman, serif"
                    : "Helvetica, Arial, sans-serif",
                  fontWeight: line.bold ? 700 : 400,
                }}
              >
                <span className="sr-only">Editar texto</span>
                <textarea
                  value={line.text}
                  rows={1}
                  spellCheck={false}
                  className={`h-full w-full resize-none border-0 p-0 leading-none outline-none ${
                    covering
                      ? "bg-white text-[#12110f]"
                      : "bg-transparent text-transparent caret-transparent"
                  }`}
                  onFocus={() => setActive(line.id)}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLines((current) =>
                      current.map((item) =>
                        item.id === line.id ? { ...item, text: value } : item,
                      ),
                    );
                  }}
                />
              </label>
            );
          })}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-[2px] bg-muted px-3 py-2 text-sm text-muted-foreground">
          {notice}{" "}
          {lines.length === 0 ? (
            <Link href="/pdf/" className="text-primary underline-offset-4 hover:underline">
              Ir a Firmar PDF
            </Link>
          ) : fontNames.length ? (
            <span> Fuentes: {fontNames.slice(0, 4).join(", ")}.</span>
          ) : null}
        </p>
      ) : null}
      {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
    </div>
  );
}
