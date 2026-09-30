"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Download, FileUp, Minus, Plus } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { PdfFormViewer, type PdfFormHandle } from "@/components/pdf-form-viewer";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { bytesLabel } from "@/lib/limits";
import {
  createSampleForm,
  listPdfFields,
  suggestedFillFileName,
  type PdfFormField,
} from "@/lib/pdf-fill";
import { noticeForSave, saveBlob } from "@/lib/save-file";

function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

function clampScale(value: number) {
  return Math.min(2, Math.max(0.7, Math.round(value * 20) / 20));
}

export function PdfFillTool() {
  const { pro, limit, upgrade, beforeRun, afterRun } = useJobGuard();
  const handle = useRef<PdfFormHandle | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [source, setSource] = useState<ArrayBuffer | null>(null);
  const [fields, setFields] = useState<PdfFormField[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [fieldCount, setFieldCount] = useState(0);
  const [xfa, setXfa] = useState(false);
  const [scale, setScale] = useState(1);
  const search = useSearchParams();
  const demo = search.get("demo") === "1";

  async function openBytes(data: ArrayBuffer, name: string) {
    if (data.byteLength > limit.pdfBytes) {
      throw new Error(
        pro
          ? `El PDF pesa más de ${bytesLabel(limit.pdfBytes)}.`
          : `Gratis son ${bytesLabel(limit.pdfBytes)}. Pro admite archivos más grandes.`,
      );
    }
    const found = await listPdfFields(data.slice(0));
    setFields(found);
    setFileName(name);
    setPageIndex(0);
    setSource(data.slice(0));
    if (found.length === 0) {
      setNotice(
        "Si ves casillas azules, son las del PDF: pulsa y escribe ahí. Si no hay ninguna, este archivo no trae campos (escaneo o PDF ‘impreso’). Eso no se inventa; usa Firmar PDF.",
      );
    } else {
      setNotice(
        `${found.length} campo${found.length === 1 ? "" : "s"} del propio PDF. Pulsa la casilla y escribe; no es texto pintado encima.`,
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
    handle.current = null;
    try {
      await openBytes(await file.arrayBuffer(), file.name);
    } catch (caught) {
      setSource(null);
      setFields([]);
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo abrir el PDF. Si está protegido con contraseña, quítala primero.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function openSample() {
    setBusy(true);
    setError("");
    setNotice("");
    handle.current = null;
    try {
      await openBytes(await createSampleForm(), "ejemplo-campos.pdf");
    } catch (caught) {
      setSource(null);
      setFields([]);
      setError(
        caught instanceof Error ? caught.message : "No se pudo crear el ejemplo.",
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!demo || source) return;
    void openSample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  async function download() {
    if (!handle.current) {
      setError("Espera a que cargue el PDF.");
      return;
    }
    if (!beforeRun()) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await handle.current.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const result = await saveBlob(blob, suggestedFillFileName(fileName));
      setNotice(
        noticeForSave(
          result,
          "Listo. Los valores van en los campos originales del PDF.",
        ),
      );
      afterRun();
    } catch {
      setError("No se pudo guardar. Prueba con otro PDF (sin contraseña).");
    } finally {
      setBusy(false);
    }
  }

  if (!source) {
    return (
      <div className="mx-auto max-w-2xl">
        <FileDrop
          accept="application/pdf,.pdf"
          busy={busy}
          dropTitle="PDF con campos"
          tapTitle="Elige el PDF del teléfono"
          cta="Elegir PDF"
          hint="Tiene que traer casillas de formulario. Si es un escaneo, no hay campos que rellenar."
          busyHint="Abriendo el formulario del PDF."
          onFiles={(list) => void takeFile(list[0])}
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿La máquina va justa o no tienes un PDF a mano?
        </p>
        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            className="h-12"
            onClick={() => void openSample()}
            disabled={busy}
          >
            Probar ahora con un ejemplo
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
    <form
      className="grid gap-4 pb-24"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="no-print sticky top-[5.5rem] z-30 flex flex-wrap items-center gap-2 rounded-[2px] bg-card/95 p-2 shadow-sm ring-1 ring-foreground/10 backdrop-blur-md sm:top-[6.25rem] sm:p-3">
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
          className="size-11"
          aria-label="Alejar"
          onClick={() => setScale((current) => clampScale(current - 0.15))}
        >
          <Minus />
        </Button>
        <span className="min-w-12 text-center text-xs tabular-nums text-muted-foreground">
          {Math.round(scale * 100)}%
        </span>
        <Button
          type="button"
          variant="outline"
          className="size-11"
          aria-label="Acercar"
          onClick={() => setScale((current) => clampScale(current + 0.15))}
        >
          <Plus />
        </Button>
        <Button
          type="button"
          className="ml-auto h-11"
          onClick={() => void download()}
          disabled={busy}
        >
          <Download />
          {busy ? "Preparando…" : "Guardar PDF"}
        </Button>
      </div>

      <p className="no-print text-sm text-muted-foreground">
        {fileName}
        {fieldCount ? ` · ${fieldCount} campos` : ""}
        {xfa ? " · formulario XFA" : ""}
        . Las cajas azuladas son las del PDF: escribe dentro.
      </p>

      <PdfFormViewer
        data={source}
        pageIndex={pageIndex}
        scale={scale}
        fields={fields}
        onMeta={(meta) => {
          handle.current = meta;
          setPageCount(meta.pageCount);
          setFieldCount(meta.fieldCount);
          setXfa(meta.xfa);
        }}
      />

      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-[2px] bg-muted px-3 py-2 text-sm text-muted-foreground">
          {notice}{" "}
          {fieldCount === 0 && !xfa ? (
            <Link href="/pdf/" className="text-primary underline-offset-4 hover:underline">
              Ir a Firmar PDF
            </Link>
          ) : null}
        </p>
      ) : null}
      {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
    </form>
  );
}
