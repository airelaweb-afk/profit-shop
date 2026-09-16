"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Printer, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatEuro,
  lineTotal,
  newId,
  parseClients,
  quoteNumber,
  quoteTotals,
  sampleClientText,
  sampleIssuer,
  sampleServices,
  validUntil,
  type Issuer,
  type ServiceLine,
} from "@/lib/quotes";

const KEY = "luna-oficio-quote-tool";
const EMPTY = "";
const listeners = new Set<() => void>();

type Stored = {
  issuer: Issuer;
  services: ServiceLine[];
  clientsText: string;
};

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseStored(json: string): Stored {
  if (!json) {
    return {
      issuer: sampleIssuer,
      services: sampleServices,
      clientsText: sampleClientText,
    };
  }
  try {
    const parsed = JSON.parse(json) as Partial<Stored>;
    return {
      issuer: { ...sampleIssuer, ...parsed.issuer },
      services:
        Array.isArray(parsed.services) && parsed.services.length > 0
          ? parsed.services
          : sampleServices,
      clientsText: parsed.clientsText ?? sampleClientText,
    };
  } catch {
    return {
      issuer: sampleIssuer,
      services: sampleServices,
      clientsText: sampleClientText,
    };
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

export function QuoteBatchTool() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);

  const [error, setError] = useState("");
  const clients = useMemo(
    () => parseClients(stored.clientsText).slice(0, 30),
    [stored.clientsText],
  );
  const activeServices = stored.services.filter(
    (line) => line.name.trim() && line.price > 0 && line.quantity > 0,
  );
  const totals = quoteTotals(activeServices, stored.issuer.taxPercent);

  function patch(partial: Partial<Stored>) {
    write({ ...stored, ...partial });
  }

  function patchIssuer(partial: Partial<Issuer>) {
    patch({ issuer: { ...stored.issuer, ...partial } });
  }

  function setService(id: string, partial: Partial<ServiceLine>) {
    patch({
      services: stored.services.map((line) =>
        line.id === id ? { ...line, ...partial } : line,
      ),
    });
  }

  function addService() {
    patch({
      services: [
        ...stored.services,
        { id: newId(), name: "", quantity: 1, price: 0 },
      ],
    });
  }

  function printQuotes() {
    setError("");
    if (!stored.issuer.name.trim()) {
      setError("Pon el nombre de tu negocio: sale en la cabecera de cada presupuesto.");
      return;
    }
    if (activeServices.length === 0) {
      setError("Añade al menos un servicio con precio.");
      return;
    }
    if (clients.length === 0) {
      setError("Pega una lista de clientes. Una línea por presupuesto.");
      return;
    }
    window.print();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
      <form
        className="no-print flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          printQuotes();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Tus datos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Se copian en los {clients.length || "—"} presupuestos. No se envían
            a ningún servidor.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Negocio / autónomo" htmlFor="issuer-name">
              <Input
                id="issuer-name"
                className="h-10"
                value={stored.issuer.name}
                onChange={(event) => patchIssuer({ name: event.target.value })}
                placeholder="Estudio Clara López"
              />
            </Field>
            <Field label="NIF / CIF / RFC" htmlFor="issuer-tax">
              <Input
                id="issuer-tax"
                className="h-10"
                value={stored.issuer.taxId}
                onChange={(event) => patchIssuer({ taxId: event.target.value })}
              />
            </Field>
            <Field label="Correo" htmlFor="issuer-email">
              <Input
                id="issuer-email"
                className="h-10"
                type="email"
                value={stored.issuer.email}
                onChange={(event) => patchIssuer({ email: event.target.value })}
              />
            </Field>
            <Field label="Teléfono" htmlFor="issuer-phone">
              <Input
                id="issuer-phone"
                className="h-10"
                value={stored.issuer.phone}
                onChange={(event) => patchIssuer({ phone: event.target.value })}
              />
            </Field>
            <Field label="IVA %" htmlFor="issuer-taxp">
              <Input
                id="issuer-taxp"
                className="h-10"
                type="number"
                min={0}
                max={30}
                value={stored.issuer.taxPercent}
                onChange={(event) =>
                  patchIssuer({ taxPercent: Number(event.target.value) || 0 })
                }
              />
            </Field>
            <Field label="Validez (días)" htmlFor="issuer-valid">
              <Input
                id="issuer-valid"
                className="h-10"
                type="number"
                min={1}
                max={90}
                value={stored.issuer.validDays}
                onChange={(event) =>
                  patchIssuer({ validDays: Number(event.target.value) || 14 })
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Condiciones" htmlFor="issuer-terms">
                <Textarea
                  id="issuer-terms"
                  rows={3}
                  value={stored.issuer.conditions}
                  onChange={(event) =>
                    patchIssuer({ conditions: event.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">Servicios</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Los mismos conceptos salen en todos los presupuestos. Precio por
                unidad, en euros.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addService}>
              <Plus />
              Línea
            </Button>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {stored.services.map((line) => (
              <li
                key={line.id}
                className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem_2rem]"
              >
                <Input
                  className="h-10"
                  placeholder="Concepto"
                  value={line.name}
                  onChange={(event) =>
                    setService(line.id, { name: event.target.value })
                  }
                  aria-label="Concepto"
                />
                <Input
                  className="h-10"
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(event) =>
                    setService(line.id, {
                      quantity: Number(event.target.value) || 0,
                    })
                  }
                  aria-label="Cantidad"
                />
                <Input
                  className="h-10"
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.price / 100}
                  onChange={(event) =>
                    setService(line.id, {
                      price: Math.round(Number(event.target.value) * 100) || 0,
                    })
                  }
                  aria-label="Precio en euros"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar línea"
                  onClick={() =>
                    patch({
                      services: stored.services.filter((item) => item.id !== line.id),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Subtotal {formatEuro(totals.subtotal)} · IVA {formatEuro(totals.tax)}{" "}
            · Total {formatEuro(totals.total)}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">A quién se los mandas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Una línea = un presupuesto. Formato:{" "}
            <span className="text-foreground">empresa, contacto, correo</span>.
            El contacto y el correo son opcionales.
          </p>
          <Textarea
            className="mt-4 min-h-48 font-mono text-sm"
            value={stored.clientsText}
            onChange={(event) => patch({ clientsText: event.target.value })}
            aria-label="Lista de clientes"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {clients.length === 0
              ? "No hay líneas válidas todavía."
              : `Vas a generar ${clients.length} presupuesto${clients.length === 1 ? "" : "s"}. Máximo 30.`}
          </p>
        </section>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" className="h-11 px-5">
            <Printer />
            Generar e imprimir {clients.length || ""} presupuestos
          </Button>
          <p className="max-w-sm self-center text-xs text-muted-foreground">
            En el diálogo de impresión puedes “Guardar como PDF”. Cada
            presupuesto sale en su página.
          </p>
        </div>
      </form>

      <aside className="no-print lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="text-xs tracking-wide text-primary uppercase">
            Vista previa
          </p>
          <h2 className="mt-1 font-heading text-2xl">
            {clients[0]?.company || "Primer cliente"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {quoteNumber(0)} · válido hasta {validUntil(stored.issuer.validDays)}
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {activeServices.length === 0 ? (
              <li className="text-muted-foreground">Añade un servicio.</li>
            ) : (
              activeServices.map((line) => (
                <li key={line.id} className="flex justify-between gap-3">
                  <span>
                    {line.name}
                    {line.quantity > 1 ? ` ×${line.quantity}` : ""}
                  </span>
                  <span>{formatEuro(lineTotal(line))}</span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-medium">
            <span>Total</span>
            <span>{formatEuro(totals.total)}</span>
          </div>
        </div>
        {clients.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Cuando pegues clientes, aquí ves el primero. El resto sale al
            imprimir.
          </p>
        ) : null}
      </aside>

      <div className="quote-print hidden">
        {clients.map((client, index) => (
          <article key={`${client.company}-${index}`} className="quote-sheet">
            <header className="flex items-start justify-between gap-6">
              <div>
                <p className="font-heading text-2xl">{stored.issuer.name}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {[stored.issuer.taxId, stored.issuer.email, stored.issuer.phone]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{quoteNumber(index)}</p>
                <p>Válido hasta {validUntil(stored.issuer.validDays)}</p>
              </div>
            </header>
            <h1 className="mt-8 font-heading text-3xl">Presupuesto</h1>
            <p className="mt-2 text-sm">
              Para <strong>{client.company}</strong>
              {client.contact ? ` · ${client.contact}` : ""}
              {client.email ? ` · ${client.email}` : ""}
            </p>
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 font-medium">Concepto</th>
                  <th className="py-2 font-medium">Cant.</th>
                  <th className="py-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {activeServices.map((line) => (
                  <tr key={line.id} className="border-b border-neutral-200">
                    <td className="py-2">{line.name}</td>
                    <td className="py-2">{line.quantity}</td>
                    <td className="py-2 text-right">{formatEuro(lineTotal(line))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 ml-auto w-56 text-sm">
              <div className="flex justify-between">
                <dt>Base</dt>
                <dd>{formatEuro(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>IVA {stored.issuer.taxPercent}%</dt>
                <dd>{formatEuro(totals.tax)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t pt-1 font-medium">
                <dt>Total</dt>
                <dd>{formatEuro(totals.total)}</dd>
              </div>
            </dl>
            <p className="mt-8 text-sm text-neutral-600">{stored.issuer.conditions}</p>
          </article>
        ))}
      </div>
    </div>
  );
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
