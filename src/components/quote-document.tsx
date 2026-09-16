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
  const addressLine = [issuer.address, issuer.city].filter(Boolean).join(" · ");

  return (
    <article className="quote-doc">
      <header className="quote-doc-top">
        <div className="quote-doc-brand">
          {issuer.logoDataUrl ? (
            <img
              src={issuer.logoDataUrl}
              alt={`Logo de ${issuer.name || "tu negocio"}`}
              className="quote-doc-logo"
            />
          ) : (
            <div className="quote-doc-mark" aria-hidden>
              {initials(issuer.name)}
            </div>
          )}
          <div>
            <p className="quote-doc-studio">{issuer.name || "Tu negocio"}</p>
            <p className="quote-doc-meta">
              {[issuer.taxId && `NIF ${issuer.taxId}`, addressLine]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="quote-doc-meta">
              {[issuer.email, issuer.phone, issuer.website]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="quote-doc-stamp">
          <p>Presupuesto</p>
          <strong>{number}</strong>
        </div>
      </header>

      <div className="quote-doc-title-row">
        <div>
          <p className="quote-doc-kicker">Preparado para</p>
          <h1 className="quote-doc-client">{client.company || "Cliente"}</h1>
          <p className="quote-doc-meta">
            {[client.contact, client.email].filter(Boolean).join(" · ") ||
              "Añada contacto o correo si quiere que figure."}
          </p>
        </div>
        <dl className="quote-doc-facts">
          <div>
            <dt>Fecha</dt>
            <dd>{formatLongDate()}</dd>
          </div>
          <div>
            <dt>Válido hasta</dt>
            <dd>{validUntil(issuer.validDays)}</dd>
          </div>
          <div>
            <dt>IVA</dt>
            <dd>{issuer.taxPercent} %</dd>
          </div>
        </dl>
      </div>

      {issuer.intro ? <p className="quote-doc-intro">{issuer.intro}</p> : null}

      <table className="quote-doc-table">
        <thead>
          <tr>
            <th className="quote-doc-num">#</th>
            <th>Descripción</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {services.length === 0 ? (
            <tr>
              <td colSpan={5} className="quote-doc-empty">
                Añada servicios para completar el presupuesto.
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
          <p className="quote-doc-kicker">Condiciones</p>
          <p>{issuer.conditions || "—"}</p>
          <div className="quote-doc-sign">
            <p>Aceptación del cliente</p>
            <div className="quote-doc-sign-lines">
              <span>Fecha</span>
              <span>Firma y NIF</span>
            </div>
          </div>
        </section>
        <aside className="quote-doc-totals">
          <div>
            <span>Base imponible</span>
            <strong>{formatEuro(totals.subtotal)}</strong>
          </div>
          <div>
            <span>IVA {issuer.taxPercent} %</span>
            <strong>{formatEuro(totals.tax)}</strong>
          </div>
          <div className="quote-doc-grand">
            <span>Total</span>
            <strong>{formatEuro(totals.total)}</strong>
          </div>
        </aside>
      </div>

      <footer className="quote-doc-foot">
        <span>
          Documento informativo. No es una factura ni un justificante de pago.
        </span>
        <span>{issuer.website || issuer.email || issuer.name}</span>
      </footer>
    </article>
  );
}
