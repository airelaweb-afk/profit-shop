import { formatEuro, formatLongDate } from "@/lib/quotes";
import {
  expenseTotals,
  splitVat,
  type ExpenseHeader,
  type ExpenseRow,
} from "@/lib/expenses";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "G";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function ExpenseDocument({
  header,
  rows,
  locale = "es",
}: {
  header: ExpenseHeader;
  rows: ExpenseRow[];
  locale?: "es" | "en";
}) {
  const en = locale === "en";
  const totals = expenseTotals(rows);
  const when = formatLongDate(new Date(), locale);

  return (
    <article className="quote-doc">
      <header className="quote-doc-top">
        <div className="quote-doc-brand">
          <div className="quote-doc-mark" aria-hidden>
            {initials(header.owner || header.company)}
          </div>
          <div>
            <p className="quote-doc-studio">
              {header.company || header.owner || (en ? "Expenses" : "Gastos")}
            </p>
            <p className="quote-doc-meta">
              {[header.owner, header.period].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <div className="quote-doc-stamp">
          <p>{en ? "Expense list" : "Relación de gastos"}</p>
          <strong>{formatEuro(totals.total)}</strong>
        </div>
      </header>

      <div className="quote-doc-title-row">
        <div>
          <p className="quote-doc-kicker">{en ? "For the bookkeeper" : "Para el gestor"}</p>
          <h1 className="quote-doc-client">{header.company || (en ? "Company" : "Empresa")}</h1>
          <p className="quote-doc-meta">
            {header.period
              ? en
                ? `Period: ${header.period}`
                : `Periodo: ${header.period}`
              : en
                ? `Issued ${when}`
                : `Emitido el ${when}`}
          </p>
        </div>
        <dl className="quote-doc-facts">
          <div>
            <dt>{en ? "Receipts" : "Tickets"}</dt>
            <dd>{rows.length || "—"}</dd>
          </div>
          <div>
            <dt>{en ? "Net" : "Base"}</dt>
            <dd>{formatEuro(totals.base)}</dd>
          </div>
          <div>
            <dt>{en ? "VAT" : "IVA"}</dt>
            <dd>{formatEuro(totals.tax)}</dd>
          </div>
        </dl>
      </div>

      <table className="quote-doc-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{en ? "Date and supplier" : "Fecha y proveedor"}</th>
            <th>{en ? "VAT" : "IVA"}</th>
            <th>{en ? "Net" : "Base"}</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="quote-doc-empty">
                {en
                  ? "Paste the receipts on the left to fill the table."
                  : "Pega los tickets a la izquierda para rellenar la tabla."}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const split = splitVat(row.total, row.taxPercent);
              return (
                <tr key={`${row.vendor}-${index}`}>
                  <td className="quote-doc-num">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <p className="quote-doc-line-name">
                      {row.dateLabel} · {row.vendor}
                    </p>
                    <p className="quote-doc-line-detail">{row.concept}</p>
                  </td>
                  <td>{row.taxPercent} %</td>
                  <td>{formatEuro(split.base)}</td>
                  <td>{formatEuro(split.total)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="quote-doc-bottom">
        <div className="quote-doc-notes">
          <p>
            {header.notes ||
              (en
                ? "Internal receipt list. This is not an invoice. The data stays in this browser."
                : "Relación interna de tickets. No es una factura. Los datos se quedan en este navegador.")}
          </p>
        </div>
        <div className="quote-doc-totals">
          <div>
            <span>{en ? "Net" : "Base"}</span>
            <strong>{formatEuro(totals.base)}</strong>
          </div>
          <div>
            <span>{en ? "VAT" : "IVA"}</span>
            <strong>{formatEuro(totals.tax)}</strong>
          </div>
          <div className="quote-doc-grand">
            <span>Total</span>
            <strong>{formatEuro(totals.total)}</strong>
          </div>
        </div>
      </div>

      <p className="quote-doc-foot">
        <span>{header.owner || (en ? "Office" : "Administración")}</span>
        <span>{en ? "Expenses" : "Gastos"} · {when}</span>
      </p>
    </article>
  );
}
