import { formatEuro, formatLongDate } from "@/lib/quotes";
import {
  formatHours,
  timesheetTotals,
  type TimeEntry,
  type TimesheetHeader,
} from "@/lib/timesheet";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "H";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function TimesheetDocument({
  header,
  entries,
}: {
  header: TimesheetHeader;
  entries: TimeEntry[];
}) {
  const totals = timesheetTotals(entries, header.hourlyCents);
  const when = formatLongDate();

  return (
    <article className="quote-doc">
      <header className="quote-doc-top">
        <div className="quote-doc-brand">
          <div className="quote-doc-mark" aria-hidden>
            {initials(header.worker)}
          </div>
          <div>
            <p className="quote-doc-studio">{header.worker || "Tu nombre"}</p>
            <p className="quote-doc-meta">
              {[header.role || "Administración", header.period]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <div className="quote-doc-stamp">
          <p>Parte de horas</p>
          <strong>{formatHours(totals.minutes)}</strong>
        </div>
      </header>

      <div className="quote-doc-title-row">
        <div>
          <p className="quote-doc-kicker">Para</p>
          <h1 className="quote-doc-client">{header.client || "Cliente"}</h1>
          <p className="quote-doc-meta">
            {header.period ? `Periodo: ${header.period}` : `Emitido el ${when}`}
          </p>
        </div>
        <dl className="quote-doc-facts">
          <div>
            <dt>Líneas</dt>
            <dd>{entries.length || "—"}</dd>
          </div>
          <div>
            <dt>Total horas</dt>
            <dd>{formatHours(totals.minutes)}</dd>
          </div>
          {header.hourlyCents > 0 ? (
            <div>
              <dt>Importe</dt>
              <dd>{formatEuro(totals.amount)}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <table className="quote-doc-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha y trabajo</th>
            <th>Horas</th>
            {header.hourlyCents > 0 ? <th>Importe</th> : null}
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={header.hourlyCents > 0 ? 4 : 3} className="quote-doc-empty">
                Pega las líneas a la izquierda para rellenar la tabla.
              </td>
            </tr>
          ) : (
            entries.map((entry, index) => {
              const lineAmount =
                header.hourlyCents > 0
                  ? Math.round((entry.minutes / 60) * header.hourlyCents)
                  : 0;
              return (
                <tr key={`${entry.dateLabel}-${index}`}>
                  <td className="quote-doc-num">{String(index + 1).padStart(2, "0")}</td>
                  <td>
                    <p className="quote-doc-line-name">{entry.dateLabel}</p>
                    <p className="quote-doc-line-detail">{entry.task}</p>
                  </td>
                  <td>{formatHours(entry.minutes)}</td>
                  {header.hourlyCents > 0 ? <td>{formatEuro(lineAmount)}</td> : null}
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
              "Documento de control interno. No es una factura. Los datos se quedan en este navegador."}
          </p>
        </div>
        <div className="quote-doc-totals">
          <div>
            <span>Horas</span>
            <strong>{formatHours(totals.minutes)}</strong>
          </div>
          {header.hourlyCents > 0 ? (
            <div className="quote-doc-grand">
              <span>Importe</span>
              <strong>{formatEuro(totals.amount)}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <p className="quote-doc-foot">
        <span>{header.worker || "Administración"}</span>
        <span>Parte de horas · {when}</span>
      </p>
    </article>
  );
}
