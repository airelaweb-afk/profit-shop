import {
  formatEuro,
  formatLongDate,
  lineTotal,
  quoteNumber,
  quoteTotals,
  validUntil,
  type ClientRow,
  type Issuer,
  type ServiceLine,
} from "@/lib/quotes";

export function QuoteDocument({
  issuer,
  client,
  services,
  index,
}: {
  issuer: Issuer;
  client: ClientRow;
  services: ServiceLine[];
  index: number;
}) {
  const totals = quoteTotals(services, issuer.taxPercent);
  const number = quoteNumber(index, {
    prefix: issuer.quotePrefix,
    start: issuer.quoteStart,
  });
  const addressLine = [issuer.address, issuer.city].filter(Boolean).join(", ");

  return (
    <article className="quote-doc">
      <div className="quote-doc-accent" />
      <header className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 items-start gap-4">
          {issuer.logoDataUrl ? (
            <img
              src={issuer.logoDataUrl}
              alt={`Logo de ${issuer.name || "tu negocio"}`}
              className="quote-doc-logo"
            />
          ) : (
            <div className="quote-doc-logo-fallback" aria-hidden>
              {(issuer.name || "P").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-heading text-2xl leading-tight">
              {issuer.name || "Tu negocio"}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-neutral-600">
              {[issuer.taxId && `NIF ${issuer.taxId}`, addressLine]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="text-[13px] leading-5 text-neutral-600">
              {[issuer.email, issuer.phone, issuer.website]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
            Presupuesto
          </p>
          <p className="mt-1 font-heading text-xl">{number}</p>
          <p className="mt-2 text-[13px] text-neutral-600">
            Fecha {formatLongDate()}
          </p>
          <p className="text-[13px] text-neutral-600">
            Válido hasta {validUntil(issuer.validDays)}
          </p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-neutral-50 px-4 py-3">
          <p className="text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
            Cliente
          </p>
          <p className="mt-1 font-medium">{client.company || "—"}</p>
          {client.contact ? (
            <p className="text-[13px] text-neutral-600">{client.contact}</p>
          ) : null}
          {client.email ? (
            <p className="text-[13px] text-neutral-600">{client.email}</p>
          ) : null}
        </div>
        <div className="rounded-lg bg-neutral-50 px-4 py-3">
          <p className="text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
            Emisor
          </p>
          <p className="mt-1 font-medium">{issuer.name || "—"}</p>
          <p className="text-[13px] text-neutral-600">
            {issuer.taxId ? `NIF / CIF ${issuer.taxId}` : "Sin NIF todavía"}
          </p>
        </div>
      </div>

      {issuer.intro ? (
        <p className="mt-6 text-sm leading-6 text-neutral-700">{issuer.intro}</p>
      ) : null}

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-300 text-left text-[11px] tracking-[0.12em] text-neutral-500 uppercase">
            <th className="py-2 pr-3 font-medium">Concepto</th>
            <th className="w-16 py-2 pr-3 font-medium">Cant.</th>
            <th className="w-28 py-2 pr-3 text-right font-medium">P. unitario</th>
            <th className="w-28 py-2 text-right font-medium">Importe</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-neutral-500">
                Añade servicios para completar el presupuesto.
              </td>
            </tr>
          ) : (
            services.map((line) => (
              <tr key={line.id} className="border-b border-neutral-200">
                <td className="py-2.5 pr-3">{line.name}</td>
                <td className="py-2.5 pr-3">{line.quantity}</td>
                <td className="py-2.5 pr-3 text-right">
                  {formatEuro(line.price)}
                </td>
                <td className="py-2.5 text-right">{formatEuro(lineTotal(line))}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <dl className="mt-6 ml-auto w-64 text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-neutral-600">Base imponible</dt>
          <dd>{formatEuro(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-neutral-600">IVA {issuer.taxPercent}%</dt>
          <dd>{formatEuro(totals.tax)}</dd>
        </div>
        <div className="mt-1 flex justify-between border-t border-neutral-300 pt-2 font-medium">
          <dt>Total</dt>
          <dd>{formatEuro(totals.total)}</dd>
        </div>
      </dl>

      {issuer.conditions ? (
        <section className="mt-8 border-t border-neutral-200 pt-4">
          <p className="text-[11px] tracking-[0.14em] text-neutral-500 uppercase">
            Condiciones
          </p>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-neutral-700">
            {issuer.conditions}
          </p>
        </section>
      ) : null}

      <p className="mt-8 text-[11px] text-neutral-500">
        Este documento es un presupuesto. No es una factura ni un justificante
        de pago.
      </p>
    </article>
  );
}
