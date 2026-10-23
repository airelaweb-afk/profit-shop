import { formatEuro } from "./quotes";

export type ReminderRound = "primera" | "segunda" | "ultima";
export type ReminderChannel = "whatsapp" | "email";

export type Debtor = {
  company: string;
  amount: number;
  dateLabel: string;
  concept: string;
  phone: string;
  email: string;
};

export const sampleSender = "Clara López";

export const sampleDebtText = `Taller Sur, 450, 01/08/2026, web de la tienda, 600111222
Academia Norte, 1.200, 15/07/2026, pack mensual de redes, marta@norte.com
Clínica Alma, 280 €, 20/08/2026, sesión de marca, 611222333
Café Lumen, 90, 05/09/2026, fotos de carta
Hotel Bruma, 860, 12/06/2026, campaña de verano, 622333444
Gimnasio Ronda, 150, 28/08/2026, diseño de stories
Asesoría Vives, 320, 02/07/2026, landing de captación, vives@asesoria.es
Colegio Santa Isabel, 540, 10/08/2026, extraescolares web`;

export function parseAmount(raw: string): number | null {
  const cleaned = raw
    .replace(/€|eur|euros/gi, "")
    .replace(/\s/g, "")
    .trim();
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

function looksLikeEmail(raw: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function parsePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9 && /^[6-9]/.test(digits)) return digits;
  if (digits.length === 11 && digits.startsWith("34")) return digits.slice(2);
  if (digits.length === 12 && digits.startsWith("0034")) return digits.slice(4);
  return "";
}

export function waLink(phone: string, text: string) {
  const digits = parsePhone(phone);
  const path = digits ? `34${digits}` : "";
  return `https://wa.me/${path}?text=${encodeURIComponent(text)}`;
}

export function mailLink(email: string, subject: string, body: string) {
  const to = email.trim();
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${to ? encodeURIComponent(to) : ""}?${query}`;
}

export function parseDebtors(raw: string): Debtor[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line
        .split(/[,|;]/)
        .map((part) => part.trim())
        .filter(Boolean);
      if (parts.length === 0) return null;
      const company = parts[0] ?? "";
      let amount: number | null = null;
      let dateLabel = "";
      let phone = "";
      let email = "";
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
        if (!email && looksLikeEmail(part)) {
          email = part;
          continue;
        }
        if (!phone) {
          const parsedPhone = parsePhone(part);
          if (parsedPhone) {
            phone = parsedPhone;
            continue;
          }
        }
        conceptParts.push(part);
      }
      if (!company || amount === null || amount <= 0) return null;
      return {
        company,
        amount,
        dateLabel,
        concept: conceptParts.join(", "),
        phone,
        email,
      };
    })
    .filter((row): row is Debtor => Boolean(row))
    .slice(0, 40);
}

export function reminderSubject(
  debtor: Debtor,
  round: ReminderRound,
  locale: "es" | "en" = "es",
) {
  if (locale === "en") {
    const what = debtor.concept || "outstanding work";
    if (round === "primera") return `Payment due: ${what}`;
    if (round === "segunda")
      return `Reminder: ${what} (${formatEuro(debtor.amount)})`;
    return `Payment closing: ${what}`;
  }
  const what = debtor.concept || "trabajo pendiente";
  if (round === "primera") return `Pendiente de cobro: ${what}`;
  if (round === "segunda")
    return `Recordatorio: ${what} (${formatEuro(debtor.amount)})`;
  return `Cierre de pago: ${what}`;
}

export function reminderBody(
  debtor: Debtor,
  round: ReminderRound,
  sender: string,
  channel: ReminderChannel,
  locale: "es" | "en" = "es",
) {
  const money = formatEuro(debtor.amount);
  if (locale === "en") {
    const name = sender.trim() || "Regards";
    const job = debtor.concept || "the work";
    const since = debtor.dateLabel ? ` since ${debtor.dateLabel}` : "";
    const hi = channel === "email" ? "Hello,\n\n" : "Hello:\n\n";
    if (round === "primera") {
      return `${hi}I am writing about ${job} for ${debtor.company} (${money}${since}). When you can, please confirm whether it is queued for payment.\n\nThank you,\n${name}`;
    }
    if (round === "segunda") {
      return `${hi}A reminder of ${money} (${job} · ${debtor.company})${since}. If there is a problem with the invoice or the item, tell me and we can sort it. If it is already being processed, ignore this message.\n\nThank you,\n${name}`;
    }
    return `${hi}${job} for ${debtor.company} (${money}) is still unpaid${since}. I need the payment or a specific date this week so I can close it. If you have already sent it, tell me and I will stop.\n\n${name}`;
  }
  const name = sender.trim() || "Un saludo";
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
