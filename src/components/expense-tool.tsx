"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, Copy, Mail, MessageCircle, Printer } from "lucide-react";
import { ExpenseDocument } from "@/components/expense-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function ExpenseTool() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const rows = useMemo(() => parseExpenses(stored.list), [stored.list]);
  const totals = expenseTotals(rows);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const message = expenseMessage(stored.header, rows);

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
      setError("No se pudo copiar. Selecciona el texto a mano.");
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <form
        className="no-print flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          window.print();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">Quién entrega esto</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Una lista para el gestor, no un Excel eterno. Se queda en este
                navegador.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => write(structuredClone(sampleStored))}
              >
                Cargar ejemplo
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => write(structuredClone(emptyStored))}
              >
                Empezar de cero
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Tu nombre" htmlFor="ex-owner">
              <Input
                id="ex-owner"
                className="h-10"
                value={stored.header.owner}
                onChange={(event) => patchHeader({ owner: event.target.value })}
                placeholder="Marina Ruiz"
              />
            </Field>
            <Field label="Empresa o autónomo" htmlFor="ex-company">
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
            <Field label="Periodo" htmlFor="ex-period">
              <Input
                id="ex-period"
                className="h-10"
                value={stored.header.period}
                onChange={(event) => patchHeader({ period: event.target.value })}
                placeholder="septiembre 2026"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Los tickets</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Una línea por ticket:{" "}
            <span className="text-foreground">
              fecha, proveedor, importe con IVA, % IVA, concepto
            </span>
            . El importe es lo que pone el ticket. Si no pones IVA, se asume 21
            %.
          </p>
          <Textarea
            className="mt-4 min-h-48 font-mono text-sm"
            value={stored.list}
            onChange={(event) => write({ ...stored, list: event.target.value })}
            aria-label="Lista de gastos"
            placeholder={"08/09/2026, Papelería Central, 48.40, 21, folios"}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {rows.length === 0
              ? "No hay líneas con proveedor e importe."
              : `${rows.length} ticket${rows.length === 1 ? "" : "s"} · ${formatEuro(totals.total)} (base ${formatEuro(totals.base)} + IVA ${formatEuro(totals.tax)})`}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Nota</h2>
          <Textarea
            className="mt-3 min-h-24"
            value={stored.header.notes}
            onChange={(event) => patchHeader({ notes: event.target.value })}
            aria-label="Notas para el gestor"
          />
        </section>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Cómo se manda</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Guardas el PDF y se lo adjuntas al gestor. La web no envía nada.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" size="lg" className="h-11 px-5">
              <Printer />
              Guardar PDF
            </Button>
            <Button type="button" variant="outline" onClick={() => void copyMessage()}>
              {copied === "msg" ? <Check /> : <Copy />}
              {copied === "msg" ? "Copiado" : "Mensaje"}
            </Button>
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${message}\n\n(Adjunta el PDF.)`)}`}
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
                  href={`mailto:?subject=${encodeURIComponent(`Gastos ${stored.header.period || stored.header.company}`)}&body=${encodeURIComponent(`${message}\n\n(Adjunta el PDF.)`)}`}
                />
              }
            >
              <Mail />
              Correo
            </Button>
          </div>
        </section>
      </form>

      <div className="quote-preview-screen min-w-0">
        <p className="no-print mb-3 text-sm text-muted-foreground">
          Vista previa · lo que sale en el PDF
        </p>
        <div className="quote-print">
          <div className="quote-sheet">
            <ExpenseDocument header={stored.header} rows={rows} />
          </div>
        </div>
      </div>
    </div>
  );
}
