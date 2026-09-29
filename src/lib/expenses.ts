import { formatEuro, formatLongDate } from "./quotes";
import { parseAmount } from "./reminders";

export type ExpenseRow = {
  dateLabel: string;
  vendor: string;
  total: number;
  taxPercent: number;
  concept: string;
};

export type ExpenseHeader = {
  owner: string;
  company: string;
  period: string;
  notes: string;
};

export const blankExpenseHeader: ExpenseHeader = {
  owner: "",
  company: "",
  period: "",
  notes: "",
};

export const sampleExpenseHeader: ExpenseHeader = {
  owner: "Marina Ruiz",
  company: "Clínica Alma",
  period: "septiembre 2026",
  notes:
    "Tickets de la clínica este mes, para el gestor. Los originales los guardo yo.",
};

export const sampleExpenseText = `08/09/2026, Papelería Central, 48.40, 21, folios y tóner
09/09/2026, Renfe, 62.50, 10, AVE Valencia–Madrid
10/09/2026, Mercadona, 19.85, 10, agua y café de la oficina
11/09/2026, Movistar, 45, 21, línea de la clínica
12/09/2026, Parking Colón, 8.00, 21, visita a un paciente
15/09/2026, Amazon, 36.29, 21, archivadores
18/09/2026, Correos, 12.15, 21, envío de contratos`;

function looksLikeDate(raw: string) {
  return (
    /^\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?$/.test(raw.trim()) ||
    /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())
  );
}

function parseVatPercent(raw: string): number | null {
  const cleaned = raw.replace(/%/g, "").replace(",", ".").trim();
  if (!/^\d{1,2}(\.\d)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0 || value > 30) return null;
  return value;
}

export function splitVat(total: number, taxPercent: number) {
  const rate = Math.max(0, taxPercent);
  const base = rate === 0 ? total : Math.round(total / (1 + rate / 100));
  const tax = total - base;
  return { base, tax, total };
}

export function parseExpenses(raw: string): ExpenseRow[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line
        .split(/[;|,]/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 0) return null;

      let dateLabel = "";
      let total: number | null = null;
      let taxPercent = 21;
      let vatFound = false;
      const leftover: string[] = [];

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index] ?? "";
        if (!dateLabel && looksLikeDate(part)) {
          dateLabel = part;
          continue;
        }
        if (total === null) {
          const joined =
            /^\d+$/.test(part) &&
            parts[index + 1] &&
            /^\d{1,2}$/.test(parts[index + 1] ?? "")
              ? `${part},${parts[index + 1]}`
              : part;
          const parsed = parseAmount(joined);
          if (parsed !== null && parsed > 0) {
            total = parsed;
            if (joined.includes(",") && joined !== part) index += 1;
            continue;
          }
        }
        if (total !== null && !vatFound) {
          const vat = parseVatPercent(part);
          if (vat !== null) {
            taxPercent = vat;
            vatFound = true;
            continue;
          }
        }
        leftover.push(part);
      }

      if (total === null || leftover.length === 0) return null;
      const vendor = leftover[0] ?? "";
      const concept = leftover.slice(1).join(", ");
      if (!vendor) return null;
      return {
        dateLabel: dateLabel || "—",
        vendor,
        total,
        taxPercent,
        concept: concept || vendor,
      };
    })
    .filter((row): row is ExpenseRow => Boolean(row))
    .slice(0, 80);
}

export function expenseTotals(rows: ExpenseRow[]) {
  return rows.reduce(
    (acc, row) => {
      const split = splitVat(row.total, row.taxPercent);
      acc.base += split.base;
      acc.tax += split.tax;
      acc.total += split.total;
      return acc;
    },
    { base: 0, tax: 0, total: 0 },
  );
}

export function expenseMessage(header: ExpenseHeader, rows: ExpenseRow[]) {
  const totals = expenseTotals(rows);
  const who = header.owner.trim() || "Administración";
  const period = header.period.trim() || formatLongDate();
  const company = header.company.trim() || "la empresa";
  return `Hola,

Te envío la relación de gastos de ${company} (${period}): ${rows.length} tickets, total ${formatEuro(totals.total)} (base ${formatEuro(totals.base)} + IVA ${formatEuro(totals.tax)}).

Va el PDF. Los justificantes originales los tengo yo.

Un saludo,
${who}`;
}
