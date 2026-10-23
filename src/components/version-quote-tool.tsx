"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Plus, Printer, Trash2 } from "lucide-react";
import { QuoteDocument } from "@/components/quote-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { offerBookmark } from "@/lib/bookmark-prompt";
import {
  blankIssuer,
  englishQuoteConditions,
  englishQuoteIntro,
  formatEuro,
  newId,
  type Issuer,
  type ServiceLine,
} from "@/lib/quotes";
import {
  buildVersions,
  emptyVersionJob,
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
  if (!json) return structuredClone(emptyVersionJob);
  try {
    const parsed = JSON.parse(json) as Partial<VersionJob>;
    return {
      title: parsed.title ?? "",
      client: { ...emptyVersionJob.client, ...parsed.client },
      issuer: { ...blankIssuer, ...parsed.issuer },
      packages:
        Array.isArray(parsed.packages) && parsed.packages.length > 0
          ? parsed.packages
          : structuredClone(emptyVersionJob.packages),
      rush: parsed.rush ?? true,
      rushPercent: parsed.rushPercent ?? 30,
    };
  } catch {
    return structuredClone(emptyVersionJob);
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

const englishPackageNames: Record<string, string> = {
  "pkg-basico": "Basic",
  "pkg-recomendado": "Recommended",
  "pkg-completo": "Complete",
};

export function VersionQuoteTool({ locale = "es" }: { locale?: "es" | "en" } = {}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const job = useMemo(() => {
    if (!en) return stored;
    return {
      ...stored,
      issuer: {
        ...stored.issuer,
        intro:
          stored.issuer.intro === blankIssuer.intro ? englishQuoteIntro : stored.issuer.intro,
        conditions:
          stored.issuer.conditions === blankIssuer.conditions
            ? englishQuoteConditions
            : stored.issuer.conditions,
      },
      packages: stored.packages.map((pkg) => {
        const original = emptyVersionJob.packages.find((item) => item.id === pkg.id);
        const english = englishPackageNames[pkg.id];
        if (original && english && pkg.name === original.name) return { ...pkg, name: english };
        return pkg;
      }),
    };
  }, [stored, en]);
  const versions = useMemo(() => buildVersions(job, locale), [job, locale]);
  const [error, setError] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const preview = versions[Math.min(previewIndex, Math.max(versions.length - 1, 0))];

  function patch(partial: Partial<VersionJob>) {
    write({ ...stored, ...partial });
  }

  function patchIssuer(partial: Partial<Issuer>) {
    patch({ issuer: { ...stored.issuer, ...partial } });
  }

  function patchPackage(id: string, partial: Partial<JobPackage>) {
    patch({
      packages: stored.packages.map((pkg) =>
        pkg.id === id ? { ...pkg, ...partial } : pkg,
      ),
    });
  }

  function setLine(pkgId: string, lineId: string, partial: Partial<ServiceLine>) {
    const pkg = stored.packages.find((item) => item.id === pkgId);
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
      setError(t("Pon el nombre de tu negocio.", "Add your business name."));
      return;
    }
    if (!job.client.company.trim()) {
      setError(
        t(
          "Pon el cliente. Es un solo destinatario para todas las versiones.",
          "Add the client. One recipient for every version.",
        ),
      );
      return;
    }
    if (versions.length === 0) {
      setError(
        t(
          "Activa al menos un paquete con un concepto y un precio.",
          "Turn on at least one package with an item and a price.",
        ),
      );
      return;
    }
    window.print();
    offerBookmark();
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">{t("El trabajo y el cliente", "The job and the client")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Un encargo. Un destinatario. Varias ofertas, no varias empresas. Los datos se quedan en este navegador.",
                  "One job. One recipient. Several offers, not several companies. The data stays in this browser.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => write(structuredClone(sampleVersionJob))}
              >
                {t("Cargar ejemplo", "Load example")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => write(structuredClone(emptyVersionJob))}
              >
                {t("Empezar de cero", "Start over")}
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label={t("Título del trabajo", "Job title")} htmlFor="job-title">
                <Input
                  id="job-title"
                  className="h-10"
                  value={job.title}
                  onChange={(event) => patch({ title: event.target.value })}
                />
              </Field>
            </div>
            <Field label={t("Cliente", "Client")} htmlFor="client-company">
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
            <Field label={t("Contacto", "Contact")} htmlFor="client-contact">
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
            <Field label={t("Correo", "Email")} htmlFor="client-email">
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
            <Field label={t("Tu negocio", "Your business")} htmlFor="issuer-name">
              <Input
                id="issuer-name"
                className="h-10"
                value={job.issuer.name}
                onChange={(event) => patchIssuer({ name: event.target.value })}
              />
            </Field>
            <Field label={t("NIF / CIF", "Tax ID")} htmlFor="issuer-tax">
              <Input
                id="issuer-tax"
                className="h-10"
                value={job.issuer.taxId}
                onChange={(event) => patchIssuer({ taxId: event.target.value })}
              />
            </Field>
            <Field label={t("IVA %", "VAT %")} htmlFor="issuer-taxp">
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
            <Field label={t("Validez (días)", "Valid for (days)")} htmlFor="issuer-valid">
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
              <h2 className="font-heading text-2xl">{t("Paquetes", "Packages")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Básico, recomendado, completo. Cada uno es un presupuesto.",
                  "Basic, recommended, complete. Each one is a quote.",
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                patch({
                  packages: [
                    ...stored.packages,
                    {
                      id: newId(),
                      name: en ? "New version" : "Nueva versión",
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
              {t("Paquete", "Package")}
            </Button>
          </div>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={job.rush}
              onChange={(event) => patch({ rush: event.target.checked })}
            />
            {t(
              "Duplicar cada paquete con recargo de urgencia",
              "Duplicate each package with a rush fee",
            )}
            <Input
              className="h-8 w-16"
              type="number"
              min={1}
              max={100}
              value={job.rushPercent}
              onChange={(event) =>
                patch({ rushPercent: Number(event.target.value) || 0 })
              }
              aria-label={t("Porcentaje de urgencia", "Rush percentage")}
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
                    {t("Incluir", "Include")}
                  </label>
                  <Input
                    className="h-10 max-w-xs"
                    value={pkg.name}
                    onChange={(event) =>
                      patchPackage(pkg.id, { name: event.target.value })
                    }
                    aria-label={t("Nombre del paquete", "Package name")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                    aria-label={t("Quitar paquete", "Remove package")}
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
                  placeholder={t("Qué incluye, en una o dos frases", "What it includes, in one or two sentences")}
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
                        placeholder={t("Concepto", "Item")}
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
                        aria-label={t("Cantidad", "Quantity")}
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
                        aria-label={t("Precio en euros", "Price in euros")}
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
                  {t("Concepto", "Item")}
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

        <Button type="submit" size="lg" className="h-12 w-full px-5 self-start sm:w-auto">
          <Printer />
          {t("Guardar PDF", "Save PDF")}
          {versions.length
            ? en
              ? ` · ${versions.length} version${versions.length === 1 ? "" : "s"}`
              : ` · ${versions.length} versión${versions.length === 1 ? "" : "es"}`
            : ""}
        </Button>
      </form>

      <aside className="no-print min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {t(
              "Vista previa · una página por versión en el PDF",
              "Preview · one page per version in the PDF",
            )}
          </p>
          {versions.length > 1 ? (
            <select
              className="h-8 rounded-md border border-border bg-background px-2 text-sm"
              value={Math.min(previewIndex, versions.length - 1)}
              onChange={(event) => setPreviewIndex(Number(event.target.value))}
              aria-label={t("Versión a previsualizar", "Version to preview")}
            >
              {versions.map((version, index) => (
                <option key={version.key} value={index}>
                  {version.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div className="quote-preview-desk">
          <div className="quote-preview-screen">
            <QuoteDocument
              issuer={{
                ...job.issuer,
                intro: [preview?.includes, job.issuer.intro]
                  .filter(Boolean)
                  .join("\n\n"),
              }}
              client={job.client}
              services={preview?.lines ?? []}
              index={Math.min(previewIndex, Math.max(versions.length - 1, 0))}
              optionLabel={preview?.label}
              locale={locale}
            />
          </div>
        </div>
        {versions.length > 0 ? (
          <ul className="mt-4 grid gap-2 text-sm">
            {versions.map((version) => (
              <li key={version.key} className="flex justify-between gap-3">
                <span>{version.label}</span>
                <span className="font-medium">{formatEuro(version.total)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </aside>

      <div className="quote-print hidden">
        {versions.map((version, index) => (
          <div key={version.key} className="quote-sheet">
            <QuoteDocument
              issuer={{
                ...job.issuer,
                intro: [version.includes, job.issuer.intro]
                  .filter(Boolean)
                  .join("\n\n"),
              }}
              client={job.client}
              services={version.lines}
              index={index}
              optionLabel={version.label}
              locale={locale}
            />
          </div>
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
