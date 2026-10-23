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
import { FreeCapNote, UpgradeNudge } from "@/components/upgrade-nudge";
import { useJobGuard } from "@/components/use-job-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { offerBookmark } from "@/lib/bookmark-prompt";
import { readLogoFile } from "@/lib/logo";
import {
  blankIssuer,
  emptyServices,
  englishQuoteConditions,
  englishQuoteIntro,
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

export function QuoteBatchTool({ locale = "es" }: { locale?: "es" | "en" } = {}) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
  const { limit } = useJobGuard(locale);
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const logoInput = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [printOnly, setPrintOnly] = useState<number | null>(null);
  const [copied, setCopied] = useState("");
  const parsedClients = useMemo(
    () => parseClients(stored.clientsText),
    [stored.clientsText],
  );
  const clients = parsedClients.slice(0, limit.quotes);
  const activeServices = stored.services.filter(
    (line) => line.name.trim() && line.price > 0 && line.quantity > 0,
  );
  const totals = quoteTotals(activeServices, stored.issuer.taxPercent);
  const paperIssuer: Issuer = {
    ...stored.issuer,
    intro:
      en && stored.issuer.intro === blankIssuer.intro
        ? englishQuoteIntro
        : stored.issuer.intro,
    conditions:
      en && stored.issuer.conditions === blankIssuer.conditions
        ? englishQuoteConditions
        : stored.issuer.conditions,
    quotePrefix:
      en && stored.issuer.quotePrefix === blankIssuer.quotePrefix
        ? "QUO"
        : stored.issuer.quotePrefix,
  };
  const previewClient =
    clients[Math.min(previewIndex, Math.max(clients.length - 1, 0))] ?? {
      company: t("Nombre del cliente", "Client name"),
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
        caught instanceof Error ? caught.message : t("No se pudo usar ese logo.", "Could not use that logo."),
      );
    }
  }

  function printQuotes(onlyIndex?: number) {
    setError("");
    if (!stored.issuer.name.trim()) {
      setError(
        t(
          "Pon el nombre de tu negocio: sale en la cabecera de cada presupuesto.",
          "Add your business name: it appears at the top of every quote.",
        ),
      );
      return;
    }
    if (activeServices.length === 0) {
      setError(t("Añade al menos un servicio con precio.", "Add at least one service with a price."));
      return;
    }
    if (clients.length === 0) {
      setError(
        t(
          "Pega una lista de clientes. Una línea por presupuesto.",
          "Paste a client list. One line per quote.",
        ),
      );
      return;
    }
    setPrintOnly(onlyIndex ?? null);
    window.setTimeout(() => window.print(), 50);
  }

  useEffect(() => {
    function done() {
      setPrintOnly(null);
      offerBookmark();
    }
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  async function copyMessage(index: number) {
    const client = clients[index];
    if (!client) return;
    const text = quoteSendMessage({
      issuer: paperIssuer,
      client,
      number: quoteNumber(index, {
        prefix: paperIssuer.quotePrefix,
        start: paperIssuer.quoteStart,
      }),
      total: totals.total,
      valid: validUntil(paperIssuer.validDays, new Date(), locale),
      locale,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(`copy-${index}`);
      window.setTimeout(() => setCopied(""), 2000);
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
          printQuotes();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">{t("Tu negocio", "Your business")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Logo, NIF y datos que salen en todos los papeles. Se quedan en este navegador.",
                  "Logo, tax ID and the details that appear on every paper. They stay in this browser.",
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
                    alt={t("Logo de tu negocio", "Logo of your business")}
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
                  {t("Quitar logo", "Remove logo")}
                </Button>
              ) : null}
              {logoError ? (
                <p className="max-w-28 text-xs text-destructive">{logoError}</p>
              ) : (
                <p className="max-w-28 text-xs text-muted-foreground">
                  {t("PNG o JPG. Se ve en cada presupuesto.", "PNG or JPG. It shows on every quote.")}
                </p>
              )}
            </div>

            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <Field label={t("Nombre o negocio", "Name or business")} htmlFor="issuer-name">
                <Input
                  id="issuer-name"
                  className="h-10"
                  value={stored.issuer.name}
                  onChange={(event) => patchIssuer({ name: event.target.value })}
                  placeholder={t("Tu nombre comercial", "Your trading name")}
                />
              </Field>
              <Field label={t("NIF / CIF", "Tax ID")} htmlFor="issuer-tax">
                <Input
                  id="issuer-tax"
                  className="h-10"
                  value={stored.issuer.taxId}
                  onChange={(event) => patchIssuer({ taxId: event.target.value })}
                />
              </Field>
              <Field label={t("Dirección", "Address")} htmlFor="issuer-address">
                <Input
                  id="issuer-address"
                  className="h-10"
                  value={stored.issuer.address}
                  onChange={(event) =>
                    patchIssuer({ address: event.target.value })
                  }
                />
              </Field>
              <Field label={t("CP y ciudad", "Postcode and city")} htmlFor="issuer-city">
                <Input
                  id="issuer-city"
                  className="h-10"
                  value={stored.issuer.city}
                  onChange={(event) => patchIssuer({ city: event.target.value })}
                />
              </Field>
              <Field label={t("Correo", "Email")} htmlFor="issuer-email">
                <Input
                  id="issuer-email"
                  className="h-10"
                  type="email"
                  value={stored.issuer.email}
                  onChange={(event) => patchIssuer({ email: event.target.value })}
                />
              </Field>
              <Field label={t("Teléfono", "Phone")} htmlFor="issuer-phone">
                <Input
                  id="issuer-phone"
                  className="h-10"
                  value={stored.issuer.phone}
                  onChange={(event) => patchIssuer({ phone: event.target.value })}
                />
              </Field>
              <Field label={t("Web", "Website")} htmlFor="issuer-web">
                <Input
                  id="issuer-web"
                  className="h-10"
                  value={stored.issuer.website}
                  onChange={(event) =>
                    patchIssuer({ website: event.target.value })
                  }
                  placeholder={t("tuweb.es", "yoursite.com")}
                />
              </Field>
              <Field label={t("IVA %", "VAT %")} htmlFor="issuer-taxp">
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
              <Field label={t("Prefijo nº", "Number prefix")} htmlFor="issuer-prefix">
                <Input
                  id="issuer-prefix"
                  className="h-10"
                  value={paperIssuer.quotePrefix}
                  onChange={(event) =>
                    patchIssuer({ quotePrefix: event.target.value })
                  }
                />
              </Field>
              <Field label={t("Empieza en", "Starts at")} htmlFor="issuer-start">
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
              <Field label={t("Validez (días)", "Valid for (days)")} htmlFor="issuer-valid">
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
                <Field label={t("Texto de apertura", "Opening text")} htmlFor="issuer-intro">
                  <Textarea
                    id="issuer-intro"
                    rows={2}
                    value={paperIssuer.intro}
                    onChange={(event) =>
                      patchIssuer({ intro: event.target.value })
                    }
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label={t("Condiciones", "Terms")} htmlFor="issuer-terms">
                  <Textarea
                    id="issuer-terms"
                    rows={3}
                    value={paperIssuer.conditions}
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
              <h2 className="font-heading text-2xl">{t("Servicios", "Services")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Los mismos conceptos salen en todos los presupuestos. Precio por unidad, en euros.",
                  "The same items appear on every quote. Price per unit, in euros.",
                )}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={addService}>
              <Plus />
              {t("Línea", "Line")}
            </Button>
          </div>
          <div className="mt-4 hidden grid-cols-[minmax(0,1fr)_4.5rem_7rem_2.5rem] gap-2 text-xs text-muted-foreground sm:grid">
            <span>{t("Concepto y detalle", "Item and detail")}</span>
            <span>{t("Cant.", "Qty")}</span>
            <span>{t("P. unitario", "Unit price")}</span>
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
                    placeholder={t("Concepto", "Item")}
                    value={line.name}
                    onChange={(event) =>
                      setService(line.id, { name: event.target.value })
                    }
                    aria-label={t("Concepto", "Item")}
                  />
                  <Input
                    className="h-10"
                    placeholder={t("Qué incluye, en una frase", "What it includes, in one sentence")}
                    value={line.detail ?? ""}
                    onChange={(event) =>
                      setService(line.id, { detail: event.target.value })
                    }
                    aria-label={t("Detalle del servicio", "Service detail")}
                  />
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2 sm:contents">
                  <Field label={t("Cant.", "Qty")} htmlFor={`qty-${line.id}`} labelClassName="sm:sr-only">
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
                  <Field label={t("P. unitario", "Unit price")} htmlFor={`price-${line.id}`} labelClassName="sm:sr-only">
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
                    aria-label={t("Quitar línea", "Remove line")}
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
            {t("Base", "Net")} {formatEuro(totals.subtotal)} · {t("IVA", "VAT")} {formatEuro(totals.tax)} ·
            Total {formatEuro(totals.total)}
          </p>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("A quién se los mandas", "Who you send them to")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("Una línea = un presupuesto. Formato:", "One line = one quote. Format:")}{" "}
            <span className="text-foreground">
              {t("empresa, contacto, correo", "company, contact, email")}
            </span>
            . {t("El contacto y el correo son opcionales.", "Contact and email are optional.")}
          </p>
          <Textarea
            className="mt-4 min-h-40 font-mono text-sm"
            value={stored.clientsText}
            onChange={(event) => patch({ clientsText: event.target.value })}
            aria-label={t("Lista de clientes", "Client list")}
            placeholder={"Taller Sur, Diego Paredes, diego@tallersur.es"}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {clients.length === 0
              ? t("No hay líneas válidas todavía.", "No valid lines yet.")
              : en
                ? `You will generate ${clients.length} quote${clients.length === 1 ? "" : "s"}. Free: ${limit.quotes}.`
                : `Vas a generar ${clients.length} presupuesto${clients.length === 1 ? "" : "s"}. Gratis: ${limit.quotes}.`}
          </p>
          {parsedClients.length > limit.quotes ? (
            <UpgradeNudge
              compact
              locale={locale}
              reason={
                en
                  ? `Free covers ${limit.quotes} quotes per batch. You entered ${parsedClients.length}.`
                  : `Gratis son ${limit.quotes} presupuestos por tanda. Has puesto ${parsedClients.length}.`
              }
            />
          ) : null}
          <FreeCapNote
            locale={locale}
            text={
              en
                ? `Free: ${limit.quotes} quotes and ${limit.jobsPerDay} tasks a day`
                : `Gratis: ${limit.quotes} presupuestos y ${limit.jobsPerDay} tareas al día`
            }
          />
        </section>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">{t("Cómo se mandan", "How you send them")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Esta página no envía correos sola: no tiene tu Gmail ni WhatsApp. Prepara el PDF y el mensaje; tú los adjuntas, como con Word.",
              "This page does not send email by itself: it does not have your Gmail or WhatsApp. It prepares the PDF and the message; you attach them, as you would with Word.",
            )}
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
            <li>
              <span className="font-medium">{t("Guarda el PDF.", "Save the PDF.")}</span>{" "}
              {t(
                "Se abre el diálogo del navegador: elige “Guardar como PDF” (no la impresora). Si hay varios clientes, salen uno por página en el mismo archivo.",
                "The browser dialog opens: choose Save as PDF (not the printer). If there are several clients, each one is a page in the same file.",
              )}
            </li>
            <li>
              <span className="font-medium">{t("Copia el mensaje", "Copy the message")}</span>{" "}
              {t(
                "o ábrelo en WhatsApp / correo. El PDF no viaja solo: adjúntalo tú.",
                "or open it in WhatsApp / email. The PDF does not travel on its own: you attach it.",
              )}
            </li>
            <li>
              <span className="font-medium">{t("Si aceptan,", "If they accept,")}</span>{" "}
              {t(
                "te responden. El presupuesto no cobra ni factura.",
                "they reply. The quote does not take payment and it is not an invoice.",
              )}
            </li>
          </ol>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" size="lg" className="h-12 w-full px-5 sm:w-auto">
              <Printer />
              {t("Guardar PDF", "Save PDF")}
              {clients.length
                ? en
                  ? ` · ${clients.length} quote${clients.length === 1 ? "" : "s"}`
                  : ` · ${clients.length} presupuesto${clients.length === 1 ? "" : "s"}`
                : ""}
            </Button>
          </div>

          {clients.length > 0 ? (
            <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
              {clients.map((client, index) => {
                const number = quoteNumber(index, {
                  prefix: paperIssuer.quotePrefix,
                  start: paperIssuer.quoteStart,
                });
                const message = quoteSendMessage({
                  issuer: paperIssuer,
                  client,
                  number,
                  total: totals.total,
                  valid: validUntil(paperIssuer.validDays, new Date(), locale),
                  locale,
                });
                const mailNote = en
                  ? "(Attach the PDF you just saved.)"
                  : "(Adjunta el PDF que acabas de guardar.)";
                const waNote = en ? "(Attach the PDF.)" : "(Adjunta el PDF.)";
                const mailHref = client.email
                  ? `mailto:${encodeURIComponent(client.email)}?subject=${encodeURIComponent(`${en ? "Quote" : "Presupuesto"} ${number} · ${paperIssuer.name}`)}&body=${encodeURIComponent(`${message}\n\n${mailNote}`)}`
                  : "";
                const waHref = `https://wa.me/?text=${encodeURIComponent(`${message}\n\n${waNote}`)}`;
                return (
                  <li
                    key={`${client.company}-${index}`}
                    className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{client.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {number}
                        {client.email ? ` · ${client.email}` : t(" · sin correo", " · no email")}
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
                        {copied === `copy-${index}` ? t("Copiado", "Copied") : t("Mensaje", "Message")}
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
                          {t("Correo", "Email")}
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
              {t("Así se ve el PDF", "How the PDF looks")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("Papel A4. Lo que ves es lo que se imprime.", "A4 paper. What you see is what prints.")}
            </p>
          </div>
          {clients.length > 1 ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              {t("Cliente", "Client")}
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
              issuer={paperIssuer}
              client={previewClient}
              services={activeServices}
              index={Math.min(previewIndex, Math.max(clients.length - 1, 0))}
              locale={locale}
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
              issuer={paperIssuer}
              client={client}
              services={activeServices}
              index={index}
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
