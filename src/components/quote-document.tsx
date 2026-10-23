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

function initials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "P";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function QuoteDocument({
  issuer,
  client,
  services,
  index,
  optionLabel,
  locale = "es",
}: {
  issuer: Issuer;
  client: ClientRow;
  services: ServiceLine[];
  index: number;
  optionLabel?: string;
  locale?: "es" | "en";
}) {
  const en = locale === "en";
  const totals = quoteTotals(services, issuer.taxPercent);
  const number = quoteNumber(index, {
    prefix: issuer.quotePrefix,
    start: issuer.quoteStart,
  });
  const addressLine = [issuer.address, issuer.city].filter(Boolean).join(" · ");
  const copy = en
    ? {
        logo: `Logo of ${issuer.name || "your business"}`,
        studio: issuer.name || "Your business",
        tax: issuer.taxId ? `Tax ID ${issuer.taxId}` : "",
        stamp: optionLabel ? "Option" : "Quote",
        prepared: "Prepared for",
        client: client.company || "Client",
        contact: "Add a contact or email if you want it shown.",
        date: "Date",
        until: "Valid until",
        vat: "VAT",
        description: "Description",
        qty: "Qty",
        price: "Price",
        amount: "Amount",
        empty: "Add services to complete the quote.",
        terms: "Terms",
        accept: "Client acceptance",
        signDate: "Date",
        signId: "Signature and tax ID",
        net: "Net amount",
        total: "Total",
        foot: "Information only. This is not an invoice and not proof of payment.",
      }
    : {
        logo: `Logo de ${issuer.name || "tu negocio"}`,
        studio: issuer.name || "Tu negocio",
        tax: issuer.taxId ? `NIF ${issuer.taxId}` : "",
        stamp: optionLabel ? "Opción" : "Presupuesto",
        prepared: "Preparado para",
        client: client.company || "Cliente",
        contact: "Añada contacto o correo si quiere que figure.",
        date: "Fecha",
        until: "Válido hasta",
        vat: "IVA",
        description: "Descripción",
        qty: "Cant.",
        price: "Precio",
        amount: "Importe",
        empty: "Añada servicios para completar el presupuesto.",
        terms: "Condiciones",
        accept: "Aceptación del cliente",
        signDate: "Fecha",
        signId: "Firma y NIF",
        net: "Base imponible",
        total: "Total",
        foot: "Documento informativo. No es una factura ni un justificante de pago.",
      };

  return (
    <article className="quote-doc">
      <header className="quote-doc-top">
        <div className="quote-doc-brand">
          {issuer.logoDataUrl ? (
            <img
              src={issuer.logoDataUrl}
              alt={copy.logo}
              className="quote-doc-logo"
            />
          ) : (
            <div className="quote-doc-mark" aria-hidden>
              {initials(issuer.name)}
            </div>
          )}
          <div>
            <p className="quote-doc-studio">{copy.studio}</p>
            <p className="quote-doc-meta">
              {[copy.tax, addressLine].filter(Boolean).join(" · ")}
            </p>
            <p className="quote-doc-meta">
              {[issuer.email, issuer.phone, issuer.website]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="quote-doc-stamp">
          <p>{copy.stamp}</p>
          <strong>{optionLabel || number}</strong>
          {optionLabel ? (
            <p className="quote-doc-kicker" style={{ marginTop: 8 }}>
              {number}
            </p>
          ) : null}
        </div>
      </header>

      <div className="quote-doc-title-row">
        <div>
          <p className="quote-doc-kicker">{copy.prepared}</p>
          <h1 className="quote-doc-client">{copy.client}</h1>
          <p className="quote-doc-meta">
            {[client.contact, client.email].filter(Boolean).join(" · ") ||
              copy.contact}
          </p>
        </div>
        <dl className="quote-doc-facts">
          <div>
            <dt>{copy.date}</dt>
            <dd>{formatLongDate(new Date(), locale)}</dd>
          </div>
          <div>
            <dt>{copy.until}</dt>
            <dd>{validUntil(issuer.validDays, new Date(), locale)}</dd>
          </div>
          <div>
            <dt>{copy.vat}</dt>
            <dd>{issuer.taxPercent} %</dd>
          </div>
        </dl>
      </div>

      {issuer.intro ? <p className="quote-doc-intro">{issuer.intro}</p> : null}

      <table className="quote-doc-table">
        <thead>
          <tr>
            <th className="quote-doc-num">#</th>
            <th>{copy.description}</th>
            <th>{copy.qty}</th>
            <th>{copy.price}</th>
            <th>{copy.amount}</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={5} className="quote-doc-empty">
                {copy.empty}
              </td>
            </tr>
          ) : (
            services.map((line, lineIndex) => (
              <tr key={line.id}>
                <td className="quote-doc-num">
                  {String(lineIndex + 1).padStart(2, "0")}
                </td>
                <td>
                  <span className="quote-doc-line-name">{line.name}</span>
                  {line.detail ? (
                    <span className="quote-doc-line-detail">{line.detail}</span>
                  ) : null}
                </td>
                <td>{line.quantity}</td>
                <td>{formatEuro(line.price)}</td>
                <td>{formatEuro(lineTotal(line))}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="quote-doc-bottom">
        <section className="quote-doc-notes">
          <p className="quote-doc-kicker">{copy.terms}</p>
          <p>{issuer.conditions || "—"}</p>
          <div className="quote-doc-sign">
            <p>{copy.accept}</p>
            <div className="quote-doc-sign-lines">
              <span>{copy.signDate}</span>
              <span>{copy.signId}</span>
            </div>
          </div>
        </section>
        <aside className="quote-doc-totals">
          <div>
            <span>{copy.net}</span>
            <strong>{formatEuro(totals.subtotal)}</strong>
          </div>
          <div>
            <span>
              {copy.vat} {issuer.taxPercent} %
            </span>
            <strong>{formatEuro(totals.tax)}</strong>
          </div>
          <div className="quote-doc-grand">
            <span>{copy.total}</span>
            <strong>{formatEuro(totals.total)}</strong>
          </div>
        </aside>
      </div>

      <footer className="quote-doc-foot">
        <span>{copy.foot}</span>
        <span>{issuer.website || issuer.email || issuer.name}</span>
      </footer>
    </article>
  );
}
