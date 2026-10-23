"use client";

import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { FileDrop } from "@/components/file-drop";
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PdfExtraSlug } from "@/lib/pdf-kit";
import { bytesLabel } from "@/lib/limits";
import { newId } from "@/lib/quotes";
import { noticeForSave, type SaveResult } from "@/lib/save-file";
import {
  countPdfPages,
  downloadBytes,
  formatBytes,
  isPdfFile,
  numberPdfPages,
  removePdfPages,
  rotatePdf,
  suggestedOutName,
  watermarkPdf,
} from "@/lib/pdf-ops";

type Item = { id: string; file: File; pages: number | null };

const copy: Record<
  PdfExtraSlug,
  { drop: string; tap: string; cta: string; action: string }
> = {
  rotate: {
    drop: "Suelta el PDF que quieres girar",
    tap: "Elige el PDF que quieres girar",
    cta: "Elegir PDF",
    action: "Rotar y guardar",
  },
  numbers: {
    drop: "Suelta el PDF para numerar las páginas",
    tap: "Elige el PDF para numerar las páginas",
    cta: "Elegir PDF",
    action: "Numerar y guardar",
  },
  watermark: {
    drop: "Suelta el PDF para la marca de agua",
    tap: "Elige el PDF para la marca de agua",
    cta: "Elegir PDF",
    action: "Poner marca y guardar",
  },
  remove: {
    drop: "Suelta el PDF del que quieres quitar páginas",
    tap: "Elige el PDF del que quieres quitar páginas",
    cta: "Elegir PDF",
    action: "Quitar páginas y guardar",
  },
};

const copyEn: typeof copy = {
  rotate: {
    drop: "Drop the PDF you want to turn",
    tap: "Choose the PDF you want to turn",
    cta: "Choose PDF",
    action: "Rotate and save",
  },
  numbers: {
    drop: "Drop the PDF to number the pages",
    tap: "Choose the PDF to number the pages",
    cta: "Choose PDF",
    action: "Number and save",
  },
  watermark: {
    drop: "Drop the PDF for the watermark",
    tap: "Choose the PDF for the watermark",
    cta: "Choose PDF",
    action: "Stamp and save",
  },
  remove: {
    drop: "Drop the PDF you want to remove pages from",
    tap: "Choose the PDF you want to remove pages from",
    cta: "Choose PDF",
    action: "Delete pages and save",
  },
};

export function PdfExtraTool({
  kind,
  locale = "es",
}: {
  kind: PdfExtraSlug;
  locale?: "es" | "en";
}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
  const { pro, limit, upgrade, setUpgrade, beforeRun, afterRun } = useJobGuard(locale);
  const [item, setItem] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [start, setStart] = useState("1");
  const [mark, setMark] = useState("BORRADOR");
  const [pages, setPages] = useState("");
  const labels = (en ? copyEn : copy)[kind];

  async function addFiles(list: File[]) {
    setError("");
    setNotice("");
    const file = list.find((entry) => isPdfFile(entry));
    if (!file) {
      setError(t("Sube un archivo PDF.", "Upload a PDF file."));
      return;
    }
    if (file.size > limit.pdfBytes) {
      setUpgrade(
        pro
          ? t(
              `${file.name} pesa más de ${bytesLabel(limit.pdfBytes)}.`,
              `${file.name} is over ${bytesLabel(limit.pdfBytes)}.`,
            )
          : t(
              `${file.name} pesa más de ${bytesLabel(limit.pdfBytes)}. Pro admite archivos más grandes.`,
              `${file.name} is over ${bytesLabel(limit.pdfBytes)}. Pro allows larger files.`,
            ),
      );
      return;
    }
    try {
      const pages = await countPdfPages(await file.arrayBuffer());
      setItem({ id: newId(), file, pages });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("No se pudo leer el PDF.", "Could not read the PDF."));
    }
  }

  async function run() {
    if (!item) return;
    if (!beforeRun()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await item.file.arrayBuffer();
      let bytes: Uint8Array;
      let suffix = "editado";
      let ready = "";
      if (kind === "remove") {
        const removed = await removePdfPages(data, pages);
        bytes = removed.bytes;
        suffix = "sin-paginas";
        ready = en
          ? `Done: ${removed.removed} page${removed.removed === 1 ? "" : "s"} removed, ${removed.kept} left. ${formatBytes(bytes.byteLength)}.`
          : `Listo: ${removed.removed} página${removed.removed === 1 ? "" : "s"} fuera, quedan ${removed.kept}. ${formatBytes(bytes.byteLength)}.`;
      } else if (kind === "rotate") {
        bytes = await rotatePdf(data, angle);
        suffix = `rotado-${angle}`;
      } else if (kind === "numbers") {
        const from = Number(start);
        if (!Number.isFinite(from) || from < 1) {
          throw new Error(t("El número de arranque tiene que ser 1 o más.", "The starting number has to be 1 or more."));
        }
        bytes = await numberPdfPages(data, from);
        suffix = "numerado";
      } else {
        bytes = await watermarkPdf(data, mark);
        suffix = "marca";
      }
      const result: SaveResult = await downloadBytes(
        bytes,
        suggestedOutName(item.file.name, suffix, "pdf"),
        "application/pdf",
      );
      setNotice(noticeForSave(result, ready || (en ? `Done: ${formatBytes(bytes.byteLength)}.` : `Listo: ${formatBytes(bytes.byteLength)}.`), locale));
      afterRun();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("No se pudo terminar.", "Could not finish."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <FileDrop
        accept="application/pdf,.pdf"
        multiple={false}
        busy={busy}
        dropTitle={labels.drop}
        tapTitle={labels.tap}
        cta={labels.cta}
        hint={t("No se envía a ningún servidor.", "Nothing is uploaded.")}
        busyHint={t("Un archivo grande tarda un momento.", "A large file takes a moment.")}
        busyTitle={en ? "Opening…" : undefined}
        onFiles={(list) => void addFiles(list)}
      />
      <FreeCapNote
        locale={locale}
        text={
          en
            ? `Free: one PDF of ${bytesLabel(limit.pdfBytes)} and ${limit.jobsPerDay} tasks a day`
            : `Gratis: un PDF de ${bytesLabel(limit.pdfBytes)} y ${limit.jobsPerDay} tareas al día`
        }
      />
      {upgrade ? <UpgradeNudge reason={upgrade} compact locale={locale} /> : null}

      {item ? (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-foreground/10">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{item.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(item.file.size)}
              {item.pages
                ? en
                  ? ` · ${item.pages} page${item.pages === 1 ? "" : "s"}`
                  : ` · ${item.pages} página${item.pages === 1 ? "" : "s"}`
                : ""}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-11"
            aria-label={t("Quitar", "Remove")}
            onClick={() => setItem(null)}
          >
            <Trash2 />
          </Button>
        </div>
      ) : null}

      {kind === "rotate" ? (
        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
          {([90, 180, 270] as const).map((value) => (
            <Button
              key={value}
              type="button"
              className="h-12"
              variant={angle === value ? "default" : "outline"}
              onClick={() => setAngle(value)}
            >
              {value}°
            </Button>
          ))}
        </div>
      ) : null}

      {kind === "numbers" ? (
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="pdf-start">{t("Empezar a numerar en", "Start numbering at")}</Label>
          <Input
            id="pdf-start"
            className="h-12"
            inputMode="numeric"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
        </div>
      ) : null}

      {kind === "remove" ? (
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="pdf-remove">{t("Páginas a quitar", "Pages to delete")}</Label>
          <Input
            id="pdf-remove"
            className="h-12"
            inputMode="numeric"
            value={pages}
            onChange={(event) => setPages(event.target.value)}
            placeholder={
              item?.pages
                ? en
                  ? `For example: 1, 4-6 (${item.pages} pages)`
                  : `Por ejemplo: 1, 4-6 (hay ${item.pages})`
                : t("Por ejemplo: 1, 4-6", "For example: 1, 4-6")
            }
          />
          <p className="text-xs text-muted-foreground">
            {t(
              "Números y rangos separados por comas. Las demás páginas se quedan en su orden.",
              "Numbers and ranges, separated by commas. The other pages stay in order.",
            )}
          </p>
        </div>
      ) : null}

      {kind === "watermark" ? (
        <div className="mt-6 grid gap-1.5">
          <Label htmlFor="pdf-mark">{t("Texto de la marca", "Watermark text")}</Label>
          <Input
            id="pdf-mark"
            className="h-12"
            value={mark}
            onChange={(event) => setMark(event.target.value)}
            maxLength={72}
            placeholder="BORRADOR"
          />
        </div>
      ) : null}

      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full px-5 sm:w-auto"
          disabled={busy || !item || (kind === "remove" && !pages.trim())}
          onClick={() => void run()}
        >
          {busy ? t("Preparando…", "Preparing…") : <Download />}
          {busy ? "" : labels.action}
        </Button>
      </div>
      {error ? (
        <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {notice}
        </p>
      ) : null}
    </div>
  );
}
