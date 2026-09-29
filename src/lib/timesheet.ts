import { formatEuro, formatLongDate } from "./quotes";

export type TimeEntry = {
  dateLabel: string;
  minutes: number;
  task: string;
};

export type TimesheetHeader = {
  worker: string;
  role: string;
  client: string;
  period: string;
  hourlyCents: number;
  notes: string;
};

export const blankTimesheet: TimesheetHeader = {
  worker: "",
  role: "",
  client: "",
  period: "",
  hourlyCents: 0,
  notes: "",
};

export const sampleTimesheet: TimesheetHeader = {
  worker: "Marina Ruiz",
  role: "Administración",
  client: "Clínica Alma",
  period: "8–12 septiembre 2026",
  hourlyCents: 1800,
  notes:
    "Horas dedicadas a la clínica esta semana. Si hay que mover alguna línea, dímelo y lo corrijo.",
};

export const sampleTimeText = `08/09/2026, 3.5, citas, llamadas y cuadrar agenda de la semana
09/09/2026, 2h, preparar presupuestos de revisión anual
10/09/2026, 4:00, facturas a pacientes y envío al gestor
11/09/2026, 1.5, reunión con dirección y acta
12/09/2026, 2h30, archivo de contratos y pólizas`;

function looksLikeDate(raw: string) {
  return (
    /^\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?$/.test(raw.trim()) ||
    /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())
  );
}

export function parseHourToken(raw: string): number | null {
  const value = raw.trim().toLowerCase().replace(/\s/g, "");
  if (!value) return null;

  const clock = value.match(/^(\d{1,2}):(\d{2})$/);
  if (clock) {
    const hours = Number(clock[1]);
    const minutes = Number(clock[2]);
    if (minutes >= 60) return null;
    return hours * 60 + minutes;
  }

  const withH = value.match(/^(\d{1,2})h(\d{1,2})?$/);
  if (withH) {
    const hours = Number(withH[1]);
    const minutes = withH[2] ? Number(withH[2]) : 0;
    if (minutes >= 60) return null;
    return hours * 60 + minutes;
  }

  const decimal = value.replace(",", ".");
  if (/^\d+(\.\d{1,2})?$/.test(decimal)) {
    const hours = Number(decimal);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return null;
    return Math.round(hours * 60);
  }

  return null;
}

export function parseEntries(raw: string): TimeEntry[] {
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
      let minutes: number | null = null;
      const taskParts: string[] = [];

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index] ?? "";
        if (!dateLabel && looksLikeDate(part)) {
          dateLabel = part;
          continue;
        }
        if (minutes === null) {
          const joined =
            /^\d+$/.test(part) && parts[index + 1] && /^\d{1,2}$/.test(parts[index + 1] ?? "")
              ? `${part},${parts[index + 1]}`
              : part;
          const parsed = parseHourToken(joined);
          if (parsed !== null) {
            minutes = parsed;
            if (joined.includes(",") && joined !== part) index += 1;
            continue;
          }
        }
        taskParts.push(part);
      }

      if (minutes === null || minutes <= 0) return null;
      return {
        dateLabel: dateLabel || "—",
        minutes,
        task: taskParts.join(", ") || "Trabajo administrativo",
      };
    })
    .filter((row): row is TimeEntry => Boolean(row))
    .slice(0, 60);
}

export function formatHours(minutes: number) {
  const hours = minutes / 60;
  const rounded = Math.round(hours * 100) / 100;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0$/, "").replace(".", ",");
  return `${text} h`;
}

export function timesheetTotals(entries: TimeEntry[], hourlyCents: number) {
  const minutes = entries.reduce((sum, entry) => sum + entry.minutes, 0);
  const amount =
    hourlyCents > 0 ? Math.round((minutes / 60) * hourlyCents) : 0;
  return { minutes, amount };
}

export function timesheetMessage(header: TimesheetHeader, entries: TimeEntry[]) {
  const totals = timesheetTotals(entries, header.hourlyCents);
  const who = header.worker.trim() || "Administración";
  const client = header.client.trim() || "el cliente";
  const period = header.period.trim() || formatLongDate();
  const money =
    totals.amount > 0 ? ` Importe: ${formatEuro(totals.amount)}.` : "";
  return `Hola,

Te envío el parte de horas de ${who} para ${client} (${period}).
Total: ${formatHours(totals.minutes)}.${money}

Va el PDF adjunto. Si hay que corregir alguna línea, dímelo.

Un saludo,
${who}`;
}
