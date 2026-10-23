"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Printer,
} from "lucide-react";
import { TimesheetDocument } from "@/components/timesheet-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { offerBookmark } from "@/lib/bookmark-prompt";
import { formatEuro } from "@/lib/quotes";
import {
  blankTimesheet,
  formatHours,
  parseEntries,
  sampleTimeText,
  sampleTimesheet,
  timesheetMessage,
  timesheetTotals,
  type TimesheetHeader,
} from "@/lib/timesheet";

const KEY = "luna-oficio-timesheet";
const EMPTY = "";
const listeners = new Set<() => void>();

type Stored = {
  header: TimesheetHeader;
  list: string;
};

const emptyStored: Stored = {
  header: structuredClone(blankTimesheet),
  list: "",
};

const sampleStored: Stored = {
  header: structuredClone(sampleTimesheet),
  list: sampleTimeText,
};

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseStored(json: string): Stored {
  if (!json) return structuredClone(emptyStored);
  try {
    const parsed = JSON.parse(json) as Partial<Stored>;
    return {
      header: { ...blankTimesheet, ...parsed.header },
      list: parsed.list ?? "",
    };
  } catch {
    return structuredClone(emptyStored);
  }
}

function write(next: Stored) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

function getSnapshot() {
  return window.localStorage.getItem(KEY) ?? EMPTY;
}

function getServerSnapshot() {
  return EMPTY;
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function TimesheetTool({ locale = "es" }: { locale?: "es" | "en" } = {}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const entries = useMemo(() => parseEntries(stored.list, locale), [stored.list, locale]);
  const totals = timesheetTotals(entries, stored.header.hourlyCents);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const message = timesheetMessage(stored.header, entries, locale);
  const hourlyEuros =
    stored.header.hourlyCents > 0
      ? String(stored.header.hourlyCents / 100).replace(".", ",")
      : "";

  function patchHeader(partial: Partial<TimesheetHeader>) {
    write({ ...stored, header: { ...stored.header, ...partial } });
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setError("");
      setCopied("msg");
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setError(t("No se pudo copiar. Selecciona el texto a mano.", "Could not copy. Select the text yourself."));
    }
  }

  function printSheet() {
    window.print();
    offerBookmark();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <form
        className="no-print flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          printSheet();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">{t("Quién y para quién", "Who, and for whom")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "El parte es un papel para el cliente o el jefe. No es una factura. Se queda en este navegador.",
                  "The timesheet is a paper for the client or the manager. It is not an invoice. It stays in this browser.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => write(structuredClone(sampleStored))}
              >
                {t("Cargar ejemplo", "Load example")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => write(structuredClone(emptyStored))}
              >
                {t("Empezar de cero", "Start over")}
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label={t("Tu nombre", "Your name")} htmlFor="ts-worker">
              <Input
                id="ts-worker"
                className="h-10"
                value={stored.header.worker}
                onChange={(event) => patchHeader({ worker: event.target.value })}
                placeholder="Marina Ruiz"
              />
            </Field>
            <Field label={t("Puesto", "Role")} htmlFor="ts-role">
              <Input
                id="ts-role"
                className="h-10"
                value={stored.header.role}
                onChange={(event) => patchHeader({ role: event.target.value })}
                placeholder={t("Administración", "Office")}
              />
            </Field>
            <Field label={t("Cliente o empresa", "Client or company")} htmlFor="ts-client">
              <Input
                id="ts-client"
                className="h-10"
                value={stored.header.client}
                onChange={(event) => patchHeader({ client: event.target.value })}
                placeholder="Clínica Alma"
              />
            </Field>
            <Field label={t("Periodo", "Period")} htmlFor="ts-period">
              <Input
                id="ts-period"
                className="h-10"
                value={stored.header.period}
                onChange={(event) => patchHeader({ period: event.target.value })}
                placeholder={t("8–12 septiembre 2026", "8–12 September 2026")}
              />
            </Field>
            <Field label={t("Precio hora (opcional)", "Hourly rate (optional)")} htmlFor="ts-rate">
              <Input
                id="ts-rate"
                className="h-10"
                inputMode="decimal"
                value={hourlyEuros}
                onChange={(event) => {
                  const raw = event.target.value.replace(",", ".").trim();
                  if (!raw) {
                    patchHeader({ hourlyCents: 0 });
                    return;
                  }
                  const euros = Number(raw);
                  if (!Number.isFinite(euros) || euros < 0) return;
                  patchHeader({ hourlyCents: Math.round(euros * 100) });
                }}
                placeholder="18"
              />
            </Field>
            <p className="self-end text-sm text-muted-foreground sm:col-span-1">
              {t(
                "Si lo dejas vacío, el PDF solo suma horas.",
                "If you leave it empty, the PDF only totals the hours.",
              )}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("Las horas", "The hours")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Una línea por día. Formato:", "One line per day. Format:")}{" "}
            <span className="text-foreground">
              {t("fecha, horas, qué hiciste", "date, hours, what you did")}
            </span>
            . {t("Horas: 3.5, 3h, 2:30 o 2h30.", "Hours: 3.5, 3h, 2:30 or 2h30.")}
          </p>
          <Textarea
            className="mt-4 min-h-48 font-mono text-sm"
            value={stored.list}
            onChange={(event) => write({ ...stored, list: event.target.value })}
            aria-label={t("Lista de horas", "Hours list")}
            placeholder={"08/09/2026, 3.5, citas y llamadas"}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {entries.length === 0
              ? t("No hay líneas con horas todavía.", "No lines with hours yet.")
              : en
                ? `${entries.length} line${entries.length === 1 ? "" : "s"} · ${formatHours(totals.minutes)}${
                    totals.amount > 0 ? ` · ${formatEuro(totals.amount)}` : ""
                  }`
                : `${entries.length} línea${entries.length === 1 ? "" : "s"} · ${formatHours(totals.minutes)}${
                    totals.amount > 0 ? ` · ${formatEuro(totals.amount)}` : ""
                  }`}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("Nota al pie", "Footnote")}</h2>
          <Textarea
            className="mt-3 min-h-24"
            value={stored.header.notes}
            onChange={(event) => patchHeader({ notes: event.target.value })}
            aria-label={t("Notas del parte", "Timesheet notes")}
          />
        </section>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("Cómo se manda", "How you send it")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Guardas el PDF y lo adjuntas tú. La web no tiene tu correo.",
              "You save the PDF and attach it yourself. The site does not have your email.",
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" size="lg" className="h-12 w-full px-5 sm:w-auto">
              <Printer />
              {t("Guardar PDF", "Save PDF")}
            </Button>
            <Button type="button" variant="outline" onClick={() => void copyMessage()}>
              {copied === "msg" ? <Check /> : <Copy />}
              {copied === "msg" ? t("Copiado", "Copied") : t("Mensaje", "Message")}
            </Button>
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${message}\n\n${en ? "(Attach the PDF.)" : "(Adjunta el PDF.)"}`)}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <MessageCircle />
              WhatsApp
            </Button>
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={`mailto:?subject=${encodeURIComponent(`${en ? "Timesheet" : "Parte de horas"} · ${stored.header.client || (en ? "week" : "semana")}`)}&body=${encodeURIComponent(`${message}\n\n${en ? "(Attach the PDF.)" : "(Adjunta el PDF.)"}`)}`}
                />
              }
            >
              <Mail />
              {t("Correo", "Email")}
            </Button>
          </div>
        </section>
      </form>

      <div className="quote-preview-screen min-w-0">
        <p className="no-print mb-3 text-sm text-muted-foreground">
          {t("Vista previa · lo que sale en el PDF", "Preview · what goes in the PDF")}
        </p>
        <div className="quote-print">
          <div className="quote-sheet">
            <TimesheetDocument header={stored.header} entries={entries} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
