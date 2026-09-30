"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileUp } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bytesLabel } from "@/lib/limits";
import {
  clipWidget,
  exportSignedPdf,
  humanFieldName,
  listPdfFields,
  suggestedFillFileName,
  type PdfFieldWidget,
  type PdfFormField,
} from "@/lib/pdf-fill";
import { loadPdfjs } from "@/lib/pdfjs-worker";
import { noticeForSave, saveBlob } from "@/lib/save-file";

type PageSize = { width: number; height: number };

function isPdfFile(file: File) {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

function boxStyle(widget: PdfFieldWidget, page: PageSize) {
  const clipped = clipWidget(widget, page);
  if (!clipped) return null;
  return {
    left: `${(clipped.x / page.width) * 100}%`,
    top: `${((page.height - clipped.y - clipped.height) / page.height) * 100}%`,
    width: `${(clipped.width / page.width) * 100}%`,
    height: `${(clipped.height / page.height) * 100}%`,
  };
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<string | null>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? URL.createObjectURL(blob) : null),
      "image/jpeg",
      0.72,
    );
  });
}

function updateField(
  fields: PdfFormField[],
  name: string,
  patch: Partial<PdfFormField>,
) {
  return fields.map((field) =>
    field.name === name ? { ...field, ...patch } : field,
  );
}

export function PdfFillTool() {
  const { pro, limit, upgrade, beforeRun, afterRun } = useJobGuard();
  const pdfBytes = useRef<ArrayBuffer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [fields, setFields] = useState<PdfFormField[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sizes, setSizes] = useState<PageSize[]>([]);
  const [active, setActive] = useState<string>("");
  const [viewPage, setViewPage] = useState(0);
  const previewUrls = useRef<string[]>([]);

  const revokePreviews = useCallback(() => {
    for (const url of previewUrls.current) URL.revokeObjectURL(url);
    previewUrls.current = [];
  }, []);

  const renderPages = useCallback(async (data: ArrayBuffer) => {
    const pdfjs = await loadPdfjs();
    const task = pdfjs.getDocument({
      data: new Uint8Array(data.slice(0)),
      useWasm: false,
    });
    const pdf = await task.promise;
    const nextSizes: PageSize[] = [];
    const nextPreviews: string[] = [];
    const max = Math.min(pdf.numPages, 40);
    const scale = pdf.numPages > 8 ? 0.85 : 1;
    revokePreviews();
    for (let number = 1; number <= max; number += 1) {
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      nextSizes.push({ width: base.width, height: base.height });
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) continue;
      await page.render({ canvas, viewport }).promise;
      const url = await canvasToJpeg(canvas);
      if (url) nextPreviews.push(url);
    }
    await pdf.cleanup();
    await task.destroy();
    previewUrls.current = nextPreviews;
    setSizes(nextSizes);
    setPreviews(nextPreviews);
    setViewPage(0);
    return pdf.numPages;
  }, [revokePreviews]);

  async function openBytes(data: ArrayBuffer, name: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (data.byteLength > limit.pdfBytes) {
        throw new Error(
          pro
            ? `El PDF pesa más de ${bytesLabel(limit.pdfBytes)}.`
            : `Gratis son ${bytesLabel(limit.pdfBytes)}. Pro admite archivos más grandes.`,
        );
      }
      pdfBytes.current = data.slice(0);
      const found = await listPdfFields(data.slice(0));
      setFields(found);
      setFileName(name);
      setLoaded(true);
      const pages = await renderPages(data.slice(0));
      const extra =
        pages > 40
          ? " Solo se muestran las primeras 40 páginas; el PDF descargado lleva todas."
          : "";
      if (found.length === 0) {
        setNotice(
          "Este PDF no tiene campos originales. Un escaneo o un PDF exportado como imagen no se puede convertir en formulario de verdad: no hay cajas que rellenar, solo dibujo. Si te han mandado un modelo de Hacienda, un PDF de Word con controles o uno hecho en Acrobat, aquí sí. Si lo que quieres es marcar encima, usa Firmar PDF." +
            extra,
        );
      } else {
        setNotice(
          `${found.length} campo${found.length === 1 ? "" : "s"} del propio PDF. Escribe en la lista o pulsa una caja. El archivo sigue siendo un formulario.`,
        );
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo abrir el PDF. Si está protegido con contraseña, quítala primero.",
      );
      pdfBytes.current = null;
      setLoaded(false);
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
    await openBytes(await file.arrayBuffer(), file.name);
  }

  async function download() {
    if (!pdfBytes.current) {
      setError("Sube un PDF con campos.");
      return;
    }
    if (!beforeRun()) return;
    setBusy(true);
    setError("");
    try {
      const bytes = await exportSignedPdf({
        data: pdfBytes.current.slice(0),
        fields,
        stamps: [],
      });
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const result = await saveBlob(blob, suggestedFillFileName(fileName));
      setNotice(noticeForSave(result, "Listo. Los campos van rellenos y siguen siendo campos."));
      afterRun();
    } catch {
      setError("No se pudo guardar. Prueba con otro PDF (sin contraseña).");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl">
        <FileDrop
          accept="application/pdf,.pdf"
          busy={busy}
          dropTitle="PDF con campos"
          tapTitle="Elige el PDF del teléfono"
          cta="Elegir PDF"
          hint="Tiene que traer casillas de formulario (AcroForm). Si es un escaneo, no hay campos que rellenar."
          busyHint="Leyendo los campos del PDF."
          onFiles={(list) => void takeFile(list[0])}
        />
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

  const editable = fields.filter((field) => !field.readOnly);
  const pageIndex = Math.min(viewPage, Math.max(0, previews.length - 1));
  const size = sizes[pageIndex];
  const pageSrc = previews[pageIndex];

  function focusField(name: string) {
    setActive(name);
    const field = fields.find((item) => item.name === name);
    const page = field?.widgets[0]?.pageIndex;
    if (typeof page === "number") setViewPage(page);
  }

  return (
    <form
      className="grid gap-6 pb-24 xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] xl:pb-0"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="no-print flex flex-col gap-4">
        <section className="rounded-[2px] bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
          <h2 className="font-heading text-xl">Tu PDF</h2>
          <p className="mt-1 text-sm text-muted-foreground">{fileName}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
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
            <Button
              type="button"
              className="h-11"
              onClick={() => void download()}
              disabled={busy || editable.length === 0}
            >
              <Download />
              {busy ? "Preparando…" : "Guardar PDF"}
            </Button>
          </div>
        </section>

        {editable.length > 0 ? (
          <section className="rounded-[2px] bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
            <h2 className="font-heading text-xl">Campos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Los mismos que verías en Adobe. Pulsa uno para ir a su caja.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {fields.map((field, index) => (
                <li key={`${field.name}-${index}`} className="grid gap-1.5">
                  <Label htmlFor={`fill-field-${index}`}>
                    {humanFieldName(field.name)}
                    {field.readOnly ? " · solo lectura" : ""}
                  </Label>
                  {field.kind === "check" ? (
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        id={`fill-field-${index}`}
                        type="checkbox"
                        checked={field.checked}
                        disabled={field.readOnly}
                        onChange={(event) => {
                          focusField(field.name);
                          setFields((current) =>
                            updateField(current, field.name, {
                              checked: event.target.checked,
                            }),
                          );
                        }}
                      />
                      Marcado
                    </label>
                  ) : field.kind === "choice" || field.kind === "radio" ? (
                    <select
                      id={`fill-field-${index}`}
                      className="h-11 rounded-[2px] border border-input bg-transparent px-2.5 text-sm"
                      value={field.value}
                      disabled={field.readOnly}
                      onFocus={() => focusField(field.name)}
                      onChange={(event) =>
                        setFields((current) =>
                          updateField(current, field.name, {
                            value: event.target.value,
                          }),
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
                  ) : field.multiline ? (
                    <textarea
                      id={`fill-field-${index}`}
                      className="min-h-24 rounded-[2px] border border-input bg-transparent px-2.5 py-2 text-sm"
                      value={field.value}
                      disabled={field.readOnly}
                      onFocus={() => focusField(field.name)}
                      onChange={(event) =>
                        setFields((current) =>
                          updateField(current, field.name, {
                            value: event.target.value,
                          }),
                        )
                      }
                    />
                  ) : (
                    <Input
                      id={`fill-field-${index}`}
                      className="h-11"
                      autoComplete="off"
                      value={field.value}
                      disabled={field.readOnly}
                      onFocus={() => focusField(field.name)}
                      onChange={(event) =>
                        setFields((current) =>
                          updateField(current, field.name, {
                            value: event.target.value,
                          }),
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
          <p className="rounded-[2px] bg-muted px-3 py-2 text-sm text-muted-foreground">
            {notice}{" "}
            {editable.length === 0 ? (
              <Link href="/pdf/" className="text-primary underline-offset-4 hover:underline">
                Ir a Firmar PDF
              </Link>
            ) : null}
          </p>
        ) : null}
        {upgrade ? <UpgradeNudge reason={upgrade} compact /> : null}
      </div>

      <div className="min-w-0">
        {previews.length > 1 ? (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              disabled={pageIndex <= 0}
              onClick={() => setViewPage((current) => Math.max(0, current - 1))}
            >
              Anterior
            </Button>
            <p className="text-sm text-muted-foreground">
              Página {pageIndex + 1} de {previews.length}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              disabled={pageIndex >= previews.length - 1}
              onClick={() =>
                setViewPage((current) =>
                  Math.min(previews.length - 1, current + 1),
                )
              }
            >
              Siguiente
            </Button>
          </div>
        ) : (
          <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
            Página 1
          </p>
        )}
        {pageSrc && size ? (
          <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pageSrc}
              alt={`Página ${pageIndex + 1}`}
              className="pointer-events-none block w-full select-none"
              draggable={false}
            />
            {fields.flatMap((field, fieldIndex) =>
              field.widgets
                .filter((widget) => widget.pageIndex === pageIndex)
                .map((widget, widgetIndex) => {
                  const style = boxStyle(widget, size);
                  if (!style) return null;
                  const live = active === field.name;
                  const hot = live
                    ? "ring-2 ring-primary"
                    : "ring-1 ring-primary/35";
                  if (field.kind === "check" || field.kind === "radio") {
                    return (
                      <button
                        key={`${field.name}-${widgetIndex}`}
                        type="button"
                        style={style}
                        className={`absolute z-10 bg-accent/15 ${hot}`}
                        aria-label={humanFieldName(field.name)}
                        disabled={field.readOnly}
                        onClick={() => {
                          focusField(field.name);
                          if (field.kind === "check") {
                            setFields((current) =>
                              updateField(current, field.name, {
                                checked: !field.checked,
                              }),
                            );
                          } else {
                            setFields((current) =>
                              updateField(current, field.name, {
                                value: widget.option ?? "",
                              }),
                            );
                          }
                        }}
                      />
                    );
                  }
                  if (!live) {
                    return (
                      <button
                        key={`${field.name}-${widgetIndex}`}
                        type="button"
                        style={style}
                        className={`absolute z-10 bg-white/20 ${hot}`}
                        aria-label={humanFieldName(field.name)}
                        disabled={field.readOnly}
                        onClick={() => focusField(field.name)}
                      />
                    );
                  }
                  if (field.kind === "choice") {
                    return (
                      <select
                        key={`${field.name}-${widgetIndex}`}
                        style={style}
                        className={`absolute z-10 bg-white text-[11px] ${hot}`}
                        value={field.value}
                        disabled={field.readOnly}
                        onChange={(event) =>
                          setFields((current) =>
                            updateField(current, field.name, {
                              value: event.target.value,
                            }),
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
                    );
                  }
                  if (field.multiline) {
                    return (
                      <textarea
                        key={`${field.name}-${widgetIndex}`}
                        style={style}
                        className={`absolute z-10 bg-white/90 px-1 text-[12px] leading-tight ${hot}`}
                        value={field.value}
                        disabled={field.readOnly}
                        autoFocus={widgetIndex === 0}
                        onChange={(event) =>
                          setFields((current) =>
                            updateField(current, field.name, {
                              value: event.target.value,
                            }),
                          )
                        }
                      />
                    );
                  }
                  return (
                    <input
                      key={`${field.name}-${widgetIndex}`}
                      type="text"
                      autoComplete="off"
                      name={`luna-fill-${fieldIndex}`}
                      style={style}
                      className={`absolute z-10 bg-white/90 px-1 text-[12px] leading-tight ${hot}`}
                      value={field.value}
                      disabled={field.readOnly}
                      autoFocus={widgetIndex === 0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") event.preventDefault();
                      }}
                      onChange={(event) =>
                        setFields((current) =>
                          updateField(current, field.name, {
                            value: event.target.value,
                          }),
                        )
                      }
                    />
                  );
                }),
            )}
          </div>
        ) : null}
      </div>
    </form>
  );
}
