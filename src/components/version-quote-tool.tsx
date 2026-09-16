"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatEuro,
  lineTotal,
  newId,
  quoteNumber,
  validUntil,
  type Issuer,
  type ServiceLine,
} from "@/lib/quotes";
import {
  buildVersions,
  sampleVersionJob,
  type JobPackage,
  type VersionJob,
} from "@/lib/versions";

const KEY = "luna-oficio-versions";
const EMPTY = "";
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseStored(json: string): VersionJob {
  if (!json) return sampleVersionJob;
  try {
    const parsed = JSON.parse(json) as Partial<VersionJob>;
    return {
      title: parsed.title ?? sampleVersionJob.title,
      client: { ...sampleVersionJob.client, ...parsed.client },
      issuer: { ...sampleVersionJob.issuer, ...parsed.issuer },
      packages:
        Array.isArray(parsed.packages) && parsed.packages.length > 0
          ? parsed.packages
          : sampleVersionJob.packages,
      rush: parsed.rush ?? true,
      rushPercent: parsed.rushPercent ?? 30,
    };
  } catch {
    return sampleVersionJob;
  }
}

function write(next: VersionJob) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

function getSnapshot() {
  return window.localStorage.getItem(KEY) ?? EMPTY;
}

function getServerSnapshot() {
  return EMPTY;
}

export function VersionQuoteTool() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const job = useMemo(() => parseStored(json), [json]);
  const versions = useMemo(() => buildVersions(job), [job]);
  const [error, setError] = useState("");

  function patch(partial: Partial<VersionJob>) {
    write({ ...job, ...partial });
  }

  function patchIssuer(partial: Partial<Issuer>) {
    patch({ issuer: { ...job.issuer, ...partial } });
  }

  function patchPackage(id: string, partial: Partial<JobPackage>) {
    patch({
      packages: job.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...partial } : pkg,
      ),
    });
  }

  function setLine(pkgId: string, lineId: string, partial: Partial<ServiceLine>) {
    const pkg = job.packages.find((item) => item.id === pkgId);
    if (!pkg) return;
    patchPackage(pkgId, {
      lines: pkg.lines.map((line) =>
        line.id === lineId ? { ...line, ...partial } : line,
      ),
    });
  }

  function printQuotes() {
    setError("");
    if (!job.issuer.name.trim()) {
      setError("Pon el nombre de tu negocio.");
      return;
    }
    if (!job.client.company.trim()) {
      setError("Pon el cliente. Es un solo destinatario para todas las versiones.");
      return;
    }
    if (versions.length === 0) {
      setError("Activa al menos un paquete con un concepto y un precio.");
      return;
    }
    window.print();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <form
        className="no-print flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          printQuotes();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">El trabajo y el cliente</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Un encargo. Un destinatario. Varias ofertas, no varias empresas.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Título del trabajo" htmlFor="job-title">
                <Input
                  id="job-title"
                  className="h-10"
                  value={job.title}
                  onChange={(event) => patch({ title: event.target.value })}
                />
              </Field>
            </div>
            <Field label="Cliente" htmlFor="client-company">
              <Input
                id="client-company"
                className="h-10"
                value={job.client.company}
                onChange={(event) =>
                  patch({
                    client: { ...job.client, company: event.target.value },
                  })
                }
              />
            </Field>
            <Field label="Contacto" htmlFor="client-contact">
              <Input
                id="client-contact"
                className="h-10"
                value={job.client.contact}
                onChange={(event) =>
                  patch({
                    client: { ...job.client, contact: event.target.value },
                  })
                }
              />
            </Field>
            <Field label="Correo" htmlFor="client-email">
              <Input
                id="client-email"
                className="h-10"
                type="email"
                value={job.client.email}
                onChange={(event) =>
                  patch({
                    client: { ...job.client, email: event.target.value },
                  })
                }
              />
            </Field>
            <Field label="Tu negocio" htmlFor="issuer-name">
              <Input
                id="issuer-name"
                className="h-10"
                value={job.issuer.name}
                onChange={(event) => patchIssuer({ name: event.target.value })}
              />
            </Field>
            <Field label="NIF / CIF" htmlFor="issuer-tax">
              <Input
                id="issuer-tax"
                className="h-10"
                value={job.issuer.taxId}
                onChange={(event) => patchIssuer({ taxId: event.target.value })}
              />
            </Field>
            <Field label="IVA %" htmlFor="issuer-taxp">
              <Input
                id="issuer-taxp"
                className="h-10"
                type="number"
                min={0}
                max={30}
                value={job.issuer.taxPercent}
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
                value={job.issuer.validDays}
                onChange={(event) =>
                  patchIssuer({ validDays: Number(event.target.value) || 14 })
                }
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">Paquetes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Básico, recomendado, completo. Cada uno es un presupuesto.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                patch({
                  packages: [
                    ...job.packages,
                    {
                      id: newId(),
                      name: "Nueva versión",
                      enabled: true,
                      includes: "",
                      lines: [
                        { id: newId(), name: "", quantity: 1, price: 0 },
                      ],
                    },
                  ],
                })
              }
            >
              <Plus />
              Paquete
            </Button>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={job.rush}
              onChange={(event) => patch({ rush: event.target.checked })}
            />
            Duplicar cada paquete con recargo de urgencia
            <Input
              className="h-8 w-16"
              type="number"
              min={1}
              max={100}
              value={job.rushPercent}
              onChange={(event) =>
                patch({ rushPercent: Number(event.target.value) || 0 })
              }
              aria-label="Porcentaje de urgencia"
            />
            %
          </label>

          <div className="mt-6 flex flex-col gap-6">
            {job.packages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={pkg.enabled}
                      onChange={(event) =>
                        patchPackage(pkg.id, { enabled: event.target.checked })
                      }
                    />
                    Incluir
                  </label>
                  <Input
                    className="h-10 max-w-xs"
                    value={pkg.name}
                    onChange={(event) =>
                      patchPackage(pkg.id, { name: event.target.value })
                    }
                    aria-label="Nombre del paquete"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    aria-label="Quitar paquete"
                    onClick={() =>
                      patch({
                        packages: job.packages.filter((item) => item.id !== pkg.id),
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
                <Textarea
                  className="mt-3"
                  rows={2}
                  placeholder="Qué incluye, en una o dos frases"
                  value={pkg.includes}
                  onChange={(event) =>
                    patchPackage(pkg.id, { includes: event.target.value })
                  }
                />
                <ul className="mt-3 flex flex-col gap-2">
                  {pkg.lines.map((line) => (
                    <li
                      key={line.id}
                      className="grid gap-2 sm:grid-cols-[1fr_5rem_7rem]"
                    >
                      <Input
                        className="h-10"
                        placeholder="Concepto"
                        value={line.name}
                        onChange={(event) =>
                          setLine(pkg.id, line.id, { name: event.target.value })
                        }
                      />
                      <Input
                        className="h-10"
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) =>
                          setLine(pkg.id, line.id, {
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
                          setLine(pkg.id, line.id, {
                            price:
                              Math.round(Number(event.target.value) * 100) || 0,
                          })
                        }
                        aria-label="Precio en euros"
                      />
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    patchPackage(pkg.id, {
                      lines: [
                        ...pkg.lines,
                        { id: newId(), name: "", quantity: 1, price: 0 },
                      ],
                    })
                  }
                >
                  <Plus />
                  Concepto
                </Button>
              </div>
            ))}
          </div>
        </section>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="h-11 px-5 self-start">
          <Printer />
          Generar e imprimir {versions.length || ""} versiones
        </Button>
      </form>

      <aside className="no-print lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
          <p className="text-xs tracking-wide text-primary uppercase">
            Resumen
          </p>
          <h2 className="mt-1 font-heading text-2xl">
            {job.client.company || "Cliente"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{job.title}</p>
          {versions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Activa un paquete con precio para ver las versiones.
            </p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {versions.map((version) => (
                <li key={version.key} className="flex justify-between gap-3">
                  <span>{version.label}</span>
                  <span className="font-medium">{formatEuro(version.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <div className="quote-print hidden">
        {versions.map((version, index) => (
          <article key={version.key} className="quote-sheet">
            <header className="flex items-start justify-between gap-6">
              <div>
                <p className="font-heading text-2xl">{job.issuer.name}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  {[job.issuer.taxId, job.issuer.email, job.issuer.phone]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{quoteNumber(index)}</p>
                <p>Opción: {version.label}</p>
                <p>Válido hasta {validUntil(job.issuer.validDays)}</p>
              </div>
            </header>
            <h1 className="mt-8 font-heading text-3xl">Presupuesto</h1>
            <p className="mt-2 text-sm">
              <strong>{job.title}</strong>
            </p>
            <p className="mt-1 text-sm">
              Para <strong>{job.client.company}</strong>
              {job.client.contact ? ` · ${job.client.contact}` : ""}
              {job.client.email ? ` · ${job.client.email}` : ""}
            </p>
            {version.includes ? (
              <p className="mt-4 text-sm text-neutral-600">{version.includes}</p>
            ) : null}
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 font-medium">Concepto</th>
                  <th className="py-2 font-medium">Cant.</th>
                  <th className="py-2 text-right font-medium">Importe</th>
                </tr>
              </thead>
              <tbody>
                {version.lines.map((line) => (
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
                <dd>{formatEuro(version.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>IVA {job.issuer.taxPercent}%</dt>
                <dd>{formatEuro(version.tax)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t pt-1 font-medium">
                <dt>Total</dt>
                <dd>{formatEuro(version.total)}</dd>
              </div>
            </dl>
            <p className="mt-8 text-sm text-neutral-600">{job.issuer.conditions}</p>
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
