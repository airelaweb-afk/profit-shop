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
  exportSignedPdf,
  humanFieldName,
  listPdfFields,
  suggestedFillFileName,
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
    for (let number = 1; number <= max; number += 1) {
      const page = await pdf.getPage(number);
      const base = page.getViewport({ scale: 1 });
      nextSizes.push({ width: base.width, height: base.height });
      const viewport = page.getViewport({ scale: 1.35 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvas, viewport }).promise;
      nextPreviews.push(canvas.toDataURL("image/png"));
    }
    await pdf.cleanup();
    await task.destroy();
    setSizes(nextSizes);
    setPreviews(nextPreviews);
    return pdf.numPages;
  }, []);

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
          `${found.length} campo${found.length === 1 ? "" : "s"} del propio PDF. Escribes dentro de cada caja; el archivo sigue siendo un formulario, no texto pintado.${extra}`,
        );
        setActive(found[0]?.name ?? "");
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

  return (
    <div className="grid gap-6 pb-24 xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] xl:pb-0">
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
              {fields.map((field) => (
                <li key={field.name} className="grid gap-1.5">
                  <Label htmlFor={`fill-${field.name}`}>
                    {humanFieldName(field.name)}
                    {field.readOnly ? " · solo lectura" : ""}
                  </Label>
                  {field.kind === "check" ? (
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        id={`fill-${field.name}`}
                        type="checkbox"
                        checked={field.checked}
                        disabled={field.readOnly}
                        onChange={(event) => {
                          setActive(field.name);
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
                      id={`fill-${field.name}`}
                      className="h-11 rounded-[2px] border border-input bg-transparent px-2.5 text-sm"
                      value={field.value}
                      disabled={field.readOnly}
                      onFocus={() => setActive(field.name)}
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
                      id={`fill-${field.name}`}
                      className="min-h-24 rounded-[2px] border border-input bg-transparent px-2.5 py-2 text-sm"
                      value={field.value}
                      disabled={field.readOnly}
                      onFocus={() => setActive(field.name)}
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
                      id={`fill-${field.name}`}
                      className="h-11"
                      value={field.value}
                      disabled={field.readOnly}
                      onFocus={() => setActive(field.name)}
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
        <ol className="flex flex-col gap-6">
          {previews.map((src, pageIndex) => {
            const size = sizes[pageIndex];
            if (!size) return null;
            const pageFields = fields.filter((field) =>
              field.widgets.some((widget) => widget.pageIndex === pageIndex),
            );
            return (
              <li key={pageIndex} id={`fill-page-${pageIndex}`}>
                <p className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                  Página {pageIndex + 1}
                </p>
                <div className="relative overflow-hidden rounded-sm bg-white shadow-[0_24px_50px_-18px_rgba(40,24,10,0.45)] ring-1 ring-foreground/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Página ${pageIndex + 1}`}
                    className="block w-full select-none"
                    draggable={false}
                  />
                  {pageFields.flatMap((field) =>
                    field.widgets
                      .filter((widget) => widget.pageIndex === pageIndex)
                      .map((widget, widgetIndex) => {
                        const style = {
                          left: `${(widget.x / size.width) * 100}%`,
                          top: `${((size.height - widget.y - widget.height) / size.height) * 100}%`,
                          width: `${(widget.width / size.width) * 100}%`,
                          height: `${(widget.height / size.height) * 100}%`,
                        };
                        const hot =
                          active === field.name
                            ? "ring-2 ring-primary"
                            : "ring-1 ring-primary/40";
                        if (field.kind === "check") {
                          return (
                            <button
                              key={`${field.name}-${widgetIndex}`}
                              type="button"
                              style={style}
                              className={`absolute z-10 bg-accent/20 ${hot}`}
                              aria-label={humanFieldName(field.name)}
                              disabled={field.readOnly}
                              onClick={() => {
                                setActive(field.name);
                                setFields((current) =>
                                  updateField(current, field.name, {
                                    checked: !field.checked,
                                  }),
                                );
                              }}
                            />
                          );
                        }
                        if (field.kind === "radio") {
                          const option = widget.option ?? "";
                          return (
                            <button
                              key={`${field.name}-${widgetIndex}`}
                              type="button"
                              style={style}
                              className={`absolute z-10 bg-accent/20 ${hot}`}
                              aria-label={option || humanFieldName(field.name)}
                              disabled={field.readOnly}
                              onClick={() => {
                                setActive(field.name);
                                setFields((current) =>
                                  updateField(current, field.name, {
                                    value: option,
                                  }),
                                );
                              }}
                            />
                          );
                        }
                        if (field.kind === "choice") {
                          return (
                            <select
                              key={`${field.name}-${widgetIndex}`}
                              style={style}
                              className={`absolute z-10 bg-white/90 text-[11px] ${hot}`}
                              value={field.value}
                              disabled={field.readOnly}
                              onFocus={() => setActive(field.name)}
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
                        const Tag = field.multiline ? "textarea" : "input";
                        return (
                          <Tag
                            key={`${field.name}-${widgetIndex}`}
                            style={style}
                            className={`absolute z-10 bg-white/85 px-1 text-[12px] leading-tight text-foreground ${hot}`}
                            value={field.value}
                            disabled={field.readOnly}
                            onFocus={() => {
                              setActive(field.name);
                              document
                                .getElementById(`fill-${field.name}`)
                                ?.scrollIntoView({ block: "nearest" });
                            }}
                            onChange={(event) =>
                              setFields((current) =>
                                updateField(current, field.name, {
                                  value: event.currentTarget.value,
                                }),
                              )
                            }
                          />
                        );
                      }),
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
