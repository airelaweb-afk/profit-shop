"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Printer,
  Plus,
  Trash2,
  ImagePlus,
} from "lucide-react";
import { QuoteDocument } from "@/components/quote-document";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readLogoFile } from "@/lib/logo";
import {
  blankIssuer,
  emptyServices,
  formatEuro,
  newId,
  parseClients,
  quoteNumber,
  quoteSendMessage,
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

const emptyStored: Stored = {
  issuer: blankIssuer,
  services: emptyServices,
  clientsText: "",
};

const sampleStored: Stored = {
  issuer: sampleIssuer,
  services: sampleServices,
  clientsText: sampleClientText,
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
      issuer: { ...blankIssuer, ...parsed.issuer },
      services:
        Array.isArray(parsed.services) && parsed.services.length > 0
          ? parsed.services
          : emptyServices,
      clientsText: parsed.clientsText ?? "",
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

export function QuoteBatchTool() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const logoInput = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [printOnly, setPrintOnly] = useState<number | null>(null);
  const [copied, setCopied] = useState("");
  const clients = useMemo(
    () => parseClients(stored.clientsText).slice(0, 30),
    [stored.clientsText],
  );
  const activeServices = stored.services.filter(
    (line) => line.name.trim() && line.price > 0 && line.quantity > 0,
  );
  const totals = quoteTotals(activeServices, stored.issuer.taxPercent);
  const previewClient =
    clients[Math.min(previewIndex, Math.max(clients.length - 1, 0))] ?? {
      company: "Nombre del cliente",
      contact: "",
      email: "",
    };

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
        { id: newId(), name: "", detail: "", quantity: 1, price: 0 },
      ],
    });
  }

  async function onLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setLogoError("");
    try {
      const logoDataUrl = await readLogoFile(file);
      patchIssuer({ logoDataUrl });
    } catch (caught) {
      setLogoError(
        caught instanceof Error ? caught.message : "No se pudo usar ese logo.",
      );
    }
  }

  function printQuotes(onlyIndex?: number) {
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
    setPrintOnly(onlyIndex ?? null);
    window.setTimeout(() => window.print(), 50);
  }

  useEffect(() => {
    function done() {
      setPrintOnly(null);
    }
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  async function copyMessage(index: number) {
    const client = clients[index];
    if (!client) return;
    const text = quoteSendMessage({
      issuer: stored.issuer,
      client,
      number: quoteNumber(index, {
        prefix: stored.issuer.quotePrefix,
        start: stored.issuer.quoteStart,
      }),
      total: totals.total,
      valid: validUntil(stored.issuer.validDays),
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`copy-${index}`);
      window.setTimeout(() => setCopied(""), 2000);
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
          printQuotes();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">Tu negocio</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Logo, NIF y datos que salen en todos los papeles. Se quedan en
                este navegador.
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

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex shrink-0 flex-col items-start gap-2">
              <input
                ref={logoInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={onLogo}
              />
              <button
                type="button"
                onClick={() => logoInput.current?.click()}
                className="flex size-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-foreground/20 bg-muted/40 text-muted-foreground hover:border-foreground/40"
              >
                {stored.issuer.logoDataUrl ? (
                  <img
                    src={stored.issuer.logoDataUrl}
                    alt="Logo de tu negocio"
                    className="size-full object-contain p-2"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs">
                    <ImagePlus className="size-5" />
                    Logo
                  </span>
                )}
              </button>
              {stored.issuer.logoDataUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => patchIssuer({ logoDataUrl: "" })}
                >
                  Quitar logo
                </Button>
              ) : null}
              {logoError ? (
                <p className="max-w-28 text-xs text-destructive">{logoError}</p>
              ) : (
                <p className="max-w-28 text-xs text-muted-foreground">
                  PNG o JPG. Se ve en cada presupuesto.
                </p>
              )}
            </div>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <Field label="Negocio / autónomo" htmlFor="issuer-name">
                <Input
                  id="issuer-name"
                  className="h-10"
                  value={stored.issuer.name}
                  onChange={(event) => patchIssuer({ name: event.target.value })}
                  placeholder="Tu nombre comercial"
                />
              </Field>
              <Field label="NIF / CIF" htmlFor="issuer-tax">
                <Input
                  id="issuer-tax"
                  className="h-10"
                  value={stored.issuer.taxId}
                  onChange={(event) => patchIssuer({ taxId: event.target.value })}
                />
              </Field>
              <Field label="Dirección" htmlFor="issuer-address">
                <Input
                  id="issuer-address"
                  className="h-10"
                  value={stored.issuer.address}
                  onChange={(event) =>
                    patchIssuer({ address: event.target.value })
                  }
                />
              </Field>
              <Field label="CP y ciudad" htmlFor="issuer-city">
                <Input
                  id="issuer-city"
                  className="h-10"
                  value={stored.issuer.city}
                  onChange={(event) => patchIssuer({ city: event.target.value })}
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
              <Field label="Web" htmlFor="issuer-web">
                <Input
                  id="issuer-web"
                  className="h-10"
                  value={stored.issuer.website}
                  onChange={(event) =>
                    patchIssuer({ website: event.target.value })
                  }
                  placeholder="tuweb.es"
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
              <Field label="Prefijo nº" htmlFor="issuer-prefix">
                <Input
                  id="issuer-prefix"
                  className="h-10"
                  value={stored.issuer.quotePrefix}
                  onChange={(event) =>
                    patchIssuer({ quotePrefix: event.target.value })
                  }
                />
              </Field>
              <Field label="Empieza en" htmlFor="issuer-start">
                <Input
                  id="issuer-start"
                  className="h-10"
                  type="number"
                  min={1}
                  value={stored.issuer.quoteStart}
                  onChange={(event) =>
                    patchIssuer({
                      quoteStart: Number(event.target.value) || 1,
                    })
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
                <Field label="Texto de apertura" htmlFor="issuer-intro">
                  <Textarea
                    id="issuer-intro"
                    rows={2}
                    value={stored.issuer.intro}
                    onChange={(event) =>
                      patchIssuer({ intro: event.target.value })
                    }
                  />
                </Field>
              </div>
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
          <div className="mt-4 hidden grid-cols-[minmax(0,1fr)_4.5rem_7rem_2.5rem] gap-2 text-xs text-muted-foreground sm:grid">
            <span>Concepto y detalle</span>
            <span>Cant.</span>
            <span>P. unitario</span>
            <span />
          </div>
          <ul className="mt-1 flex flex-col gap-3">
            {stored.services.map((line) => (
              <li
                key={line.id}
                className="grid gap-2 rounded-xl border border-border p-3 sm:border-0 sm:p-0 sm:grid-cols-[minmax(0,1fr)_4.5rem_7rem_2.5rem]"
              >
                <div className="grid gap-2">
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
                    placeholder="Qué incluye, en una frase"
                    value={line.detail ?? ""}
                    onChange={(event) =>
                      setService(line.id, { detail: event.target.value })
                    }
                    aria-label="Detalle del servicio"
                  />
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:contents">
                  <Field label="Cant." htmlFor={`qty-${line.id}`} labelClassName="sm:sr-only">
                    <Input
                      id={`qty-${line.id}`}
                      className="h-10"
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(event) =>
                        setService(line.id, {
                          quantity: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field label="P. unitario" htmlFor={`price-${line.id}`} labelClassName="sm:sr-only">
                    <Input
                      id={`price-${line.id}`}
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
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-0.5"
                    aria-label="Quitar línea"
                    onClick={() =>
                      patch({
                        services: stored.services.filter(
                          (item) => item.id !== line.id,
                        ),
                      })
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Base {formatEuro(totals.subtotal)} · IVA {formatEuro(totals.tax)} ·
            Total {formatEuro(totals.total)}
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
            className="mt-4 min-h-40 font-mono text-sm"
            value={stored.clientsText}
            onChange={(event) => patch({ clientsText: event.target.value })}
            aria-label="Lista de clientes"
            placeholder={"Taller Sur, Diego Paredes, diego@tallersur.es"}
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

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Cómo se mandan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta página no envía correos sola: no tiene tu Gmail ni WhatsApp.
            Prepara el PDF y el mensaje; tú los adjuntas, como con Word.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            <li>
              <span className="font-medium">Guarda el PDF.</span> Se abre el
              diálogo del navegador: elige “Guardar como PDF” (no la impresora).
              Si hay varios clientes, salen uno por página en el mismo archivo.
            </li>
            <li>
              <span className="font-medium">Copia el mensaje</span> o ábrelo en
              WhatsApp / correo. El PDF no viaja solo: adjúntalo tú.
            </li>
            <li>
              <span className="font-medium">Si aceptan,</span> te responden.
              El presupuesto no cobra ni factura.
            </li>
          </ol>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" size="lg" className="h-11 px-5">
              <Printer />
              Guardar PDF
              {clients.length
                ? ` · ${clients.length} presupuesto${clients.length === 1 ? "" : "s"}`
                : ""}
            </Button>
          </div>

          {clients.length > 0 ? (
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
              {clients.map((client, index) => {
                const number = quoteNumber(index, {
                  prefix: stored.issuer.quotePrefix,
                  start: stored.issuer.quoteStart,
                });
                const message = quoteSendMessage({
                  issuer: stored.issuer,
                  client,
                  number,
                  total: totals.total,
                  valid: validUntil(stored.issuer.validDays),
                });
                const mailHref = client.email
                  ? `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(`Presupuesto ${number} · ${stored.issuer.name}`)}&body=${encodeURIComponent(`${message}\n\n(Adjunta el PDF que acabas de guardar.)`)}`
                  : "";
                const waHref = `https://wa.me/?text=${encodeURIComponent(`${message}\n\n(Adjunta el PDF.)`)}`;
                return (
                  <li
                    key={`${client.company}-${index}`}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{client.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {number}
                        {client.email ? ` · ${client.email}` : " · sin correo"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => printQuotes(index)}
                      >
                        <Printer />
                        PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyMessage(index)}
                      >
                        {copied === `copy-${index}` ? <Check /> : <Copy />}
                        {copied === `copy-${index}` ? "Copiado" : "Mensaje"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        nativeButton={false}
                        render={<a href={waHref} target="_blank" rel="noreferrer" />}
                      >
                        <MessageCircle />
                        WhatsApp
                      </Button>
                      {mailHref ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={<a href={mailHref} />}
                        >
                          <Mail />
                          Correo
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      </form>

      <aside className="no-print lg:sticky lg:top-20 lg:self-start">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs tracking-wide text-primary uppercase">
              Así se ve el PDF
            </p>
            <p className="text-xs text-muted-foreground">
              Papel A4. Lo que ves es lo que se imprime.
            </p>
          </div>
          {clients.length > 1 ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Cliente
              <select
                className="h-8 rounded-md border border-border bg-background px-2 text-foreground"
                value={Math.min(previewIndex, clients.length - 1)}
                onChange={(event) =>
                  setPreviewIndex(Number(event.target.value))
                }
              >
                {clients.map((client, index) => (
                  <option key={`${client.company}-${index}`} value={index}>
                    {client.company}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="quote-preview-desk">
          <div className="quote-preview-screen">
            <QuoteDocument
              issuer={stored.issuer}
              client={previewClient}
              services={activeServices}
              index={Math.min(previewIndex, Math.max(clients.length - 1, 0))}
            />
          </div>
        </div>
      </aside>

      <div className="quote-print hidden">
        {clients.map((client, index) => (
          <div
            key={`${client.company}-${index}`}
            className={
              printOnly !== null && printOnly !== index
                ? "quote-sheet skip-print"
                : "quote-sheet"
            }
          >
            <QuoteDocument
              issuer={stored.issuer}
              client={client}
              services={activeServices}
              index={index}
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
  labelClassName,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  labelClassName?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </Label>
      {children}
    </div>
  );
}
