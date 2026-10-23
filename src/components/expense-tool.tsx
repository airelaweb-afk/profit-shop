"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, Copy, Mail, MessageCircle, Printer } from "lucide-react";
import { ExpenseDocument } from "@/components/expense-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { offerBookmark } from "@/lib/bookmark-prompt";
import { formatEuro } from "@/lib/quotes";
import {
  blankExpenseHeader,
  expenseMessage,
  expenseTotals,
  parseExpenses,
  sampleExpenseHeader,
  sampleExpenseText,
  type ExpenseHeader,
} from "@/lib/expenses";

const KEY = "luna-oficio-expenses";
const EMPTY = "";
const listeners = new Set<() => void>();

type Stored = {
  header: ExpenseHeader;
  list: string;
};

const emptyStored: Stored = {
  header: structuredClone(blankExpenseHeader),
  list: "",
};

const sampleStored: Stored = {
  header: structuredClone(sampleExpenseHeader),
  list: sampleExpenseText,
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
      header: { ...blankExpenseHeader, ...parsed.header },
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

export function ExpenseTool({ locale = "es" }: { locale?: "es" | "en" } = {}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const rows = useMemo(() => parseExpenses(stored.list), [stored.list]);
  const totals = expenseTotals(rows);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const message = expenseMessage(stored.header, rows, locale);

  function patchHeader(partial: Partial<ExpenseHeader>) {
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

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <form
        className="no-print flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          window.print();
          offerBookmark();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">{t("Quién entrega esto", "Who is handing this in")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Una lista para el gestor, no un Excel eterno. Se queda en este navegador.",
                  "A list for the bookkeeper, not an endless spreadsheet. It stays in this browser.",
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
            <Field label={t("Tu nombre", "Your name")} htmlFor="ex-owner">
              <Input
                id="ex-owner"
                className="h-10"
                value={stored.header.owner}
                onChange={(event) => patchHeader({ owner: event.target.value })}
                placeholder="Marina Ruiz"
              />
            </Field>
            <Field label={t("Empresa o nombre", "Company or name")} htmlFor="ex-company">
              <Input
                id="ex-company"
                className="h-10"
                value={stored.header.company}
                onChange={(event) =>
                  patchHeader({ company: event.target.value })
                }
                placeholder="Clínica Alma"
              />
            </Field>
            <Field label={t("Periodo", "Period")} htmlFor="ex-period">
              <Input
                id="ex-period"
                className="h-10"
                value={stored.header.period}
                onChange={(event) => patchHeader({ period: event.target.value })}
                placeholder={t("septiembre 2026", "September 2026")}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("Los tickets", "The receipts")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Una línea por ticket:", "One line per receipt:")}{" "}
            <span className="text-foreground">
              {t(
                "fecha, proveedor, importe con IVA, % IVA, concepto",
                "date, supplier, amount with VAT, VAT %, item",
              )}
            </span>
            .{" "}
            {t(
              "El importe es lo que pone el ticket. Si no pones IVA, se asume 21 %.",
              "The amount is what the receipt says. If you skip VAT, 21% is assumed.",
            )}
          </p>
          <Textarea
            className="mt-4 min-h-48 font-mono text-sm"
            value={stored.list}
            onChange={(event) => write({ ...stored, list: event.target.value })}
            aria-label={t("Lista de gastos", "Expense list")}
            placeholder={"08/09/2026, Papelería Central, 48.40, 21, folios"}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length === 0
              ? t("No hay líneas con proveedor e importe.", "No lines with a supplier and an amount.")
              : en
                ? `${rows.length} receipt${rows.length === 1 ? "" : "s"} · ${formatEuro(totals.total)} (net ${formatEuro(totals.base)} + VAT ${formatEuro(totals.tax)})`
                : `${rows.length} ticket${rows.length === 1 ? "" : "s"} · ${formatEuro(totals.total)} (base ${formatEuro(totals.base)} + IVA ${formatEuro(totals.tax)})`}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("Nota", "Note")}</h2>
          <Textarea
            className="mt-3 min-h-24"
            value={stored.header.notes}
            onChange={(event) => patchHeader({ notes: event.target.value })}
            aria-label={t("Notas para el gestor", "Notes for the bookkeeper")}
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
              "Guardas el PDF y se lo adjuntas al gestor. La web no envía nada.",
              "You save the PDF and attach it for the bookkeeper. The site sends nothing.",
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
                  href={`mailto:?subject=${encodeURIComponent(`${en ? "Expenses" : "Gastos"} ${stored.header.period || stored.header.company}`)}&body=${encodeURIComponent(`${message}\n\n${en ? "(Attach the PDF.)" : "(Adjunta el PDF.)"}`)}`}
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
            <ExpenseDocument header={stored.header} rows={rows} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  );
}
