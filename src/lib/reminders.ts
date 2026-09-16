import { formatEuro } from "./quotes";

export type ReminderRound = "primera" | "segunda" | "ultima";
export type ReminderChannel = "whatsapp" | "email";

export type Debtor = {
  company: string;
  amount: number;
  dateLabel: string;
  concept: string;
};

export const sampleSender = "Clara López";

export const sampleDebtText = `Taller Sur, 450, 01/08/2026, web de la tienda
Academia Norte, 1200, 15/07/2026, pack mensual de redes
Clínica Alma, 280, 20/08/2026, sesión de marca
Café Lumen, 90, 05/09/2026, fotos de carta
Hotel Bruma, 860, 12/06/2026, campaña de verano
Gimnasio Ronda, 150, 28/08/2026, diseño de stories
Asesoría Vives, 320, 02/07/2026, landing de captación
Colegio Santa Isabel, 540, 10/08/2026, extraescolares web`;

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/€|eur|euros/gi, "").trim();
  if (!cleaned) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(cleaned)) {
    const [euros, cents = ""] = cleaned.split(",");
    return (
      Number(euros.replace(/\./g, "")) * 100 +
      Number(cents.padEnd(2, "0").slice(0, 2) || "0")
    );
  }
  if (/^\d+,\d{1,2}$/.test(cleaned)) {
    const [euros, cents] = cleaned.split(",");
    return Number(euros) * 100 + Number(cents.padEnd(2, "0").slice(0, 2));
  }
  if (/^\d+$/.test(cleaned)) return Number(cleaned) * 100;
  if (/^\d+\.\d{1,2}$/.test(cleaned)) return Math.round(Number(cleaned) * 100);
  return null;
}

function looksLikeDate(raw: string) {
  return (
    /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(raw.trim()) ||
    /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())
  );
}

export function parseDebtors(raw: string): Debtor[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,|;]/).map((part) => part.trim()).filter(Boolean);
      if (parts.length === 0) return null;
      const company = parts[0] ?? "";
      let amount: number | null = null;
      let dateLabel = "";
      const conceptParts: string[] = [];
      for (const part of parts.slice(1)) {
        if (amount === null) {
          const parsed = parseAmount(part);
          if (parsed !== null) {
            amount = parsed;
            continue;
          }
        }
        if (!dateLabel && looksLikeDate(part)) {
          dateLabel = part;
          continue;
        }
        conceptParts.push(part);
      }
      if (!company || amount === null || amount <= 0) return null;
      return {
        company,
        amount,
        dateLabel,
        concept: conceptParts.join(", "),
      };
    })
    .filter((row): row is Debtor => Boolean(row))
    .slice(0, 30);
}

export function reminderSubject(debtor: Debtor, round: ReminderRound) {
  const what = debtor.concept || "trabajo pendiente";
  if (round === "primera") return `Pendiente de cobro: ${what}`;
  if (round === "segunda") return `Recordatorio: ${what} (${formatEuro(debtor.amount)})`;
  return `Cierre de pago: ${what}`;
}

export function reminderBody(
  debtor: Debtor,
  round: ReminderRound,
  sender: string,
  channel: ReminderChannel,
) {
  const name = sender.trim() || "Un saludo";
  const money = formatEuro(debtor.amount);
  const job = debtor.concept || "el trabajo";
  const since = debtor.dateLabel ? ` desde el ${debtor.dateLabel}` : "";
  const hi = channel === "email" ? `Hola,\n\n` : `Hola:\n\n`;

  if (round === "primera") {
    return `${hi}Te escribo por ${job} de ${debtor.company} (${money}${since}). Cuando puedas, ¿me confirmas si lo tenéis en cola de pago?\n\nGracias,\n${name}`;
  }
  if (round === "segunda") {
    return `${hi}Te recuerdo el importe de ${money} (${job} · ${debtor.company})${since}. Si hay algún problema con la factura o el concepto, dímelo y lo vemos. Si ya está tramitado, ignora este mensaje.\n\nGracias,\n${name}`;
  }
  return `${hi}El ${job} de ${debtor.company} (${money}) sigue sin cobrar${since}. Necesito el pago o una fecha concreta esta semana para dejarlo cerrado. Si ya lo habéis lanzado, avísame y no insisto.\n\n${name}`;
}
