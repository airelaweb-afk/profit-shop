const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatEuro(cents: number) {
  const euros = (Math.round(cents) / 100).toFixed(2).replace(".", ",");
  return `${euros} €`;
}

export function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export type Issuer = {
  name: string;
  taxId: string;
  email: string;
  phone: string;
  conditions: string;
  taxPercent: number;
  validDays: number;
};

export type ServiceLine = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type ClientRow = {
  company: string;
  contact: string;
  email: string;
};

export const sampleIssuer: Issuer = {
  name: "Estudio Clara López",
  taxId: "12345678Z",
  email: "clara@estudio.com",
  phone: "+34 600 000 000",
  conditions:
    "50% al aceptar. El resto contra entrega. Dos rondas de revisión incluidas.",
  taxPercent: 21,
  validDays: 14,
};

export const sampleServices: ServiceLine[] = [
  {
    id: "svc-redes",
    name: "Dirección de redes · 4 semanas",
    quantity: 1,
    price: 45000,
  },
  {
    id: "svc-estrategia",
    name: "Sesión de estrategia (90 min)",
    quantity: 1,
    price: 12000,
  },
  {
    id: "svc-feed",
    name: "Diseño de 8 piezas para feed",
    quantity: 8,
    price: 2500,
  },
];

export const sampleClientText = `Academia Norte, Marta Gil, marta@norte.com
Taller Sur, Diego Paredes, diego@tallersur.es
Clínica Alma, Noelia Castro
Estudio Pino
Residencia El Olivo, Administración, admin@elolivo.es
Colegio Santa Isabel, Jefa de extraescolares
Café Lumen, Andrés Molina, andres@cafelumen.com
Gimnasio Ronda, Recepción
Hotel Bruma, Eventos, eventos@hotelbruma.es
Asesoría Vives, Laura Méndez`;

export function parseClients(raw: string): ClientRow[] {
  return raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,|;]/).map((part) => part.trim()).filter(Boolean);
      return {
        company: parts[0] ?? "",
        contact: parts[1] ?? "",
        email: parts[2] ?? "",
      };
    })
    .filter((row) => row.company.length > 0);
}

export function lineTotal(line: ServiceLine) {
  return Math.max(0, line.quantity) * Math.max(0, line.price);
}

export function quoteTotals(lines: ServiceLine[], taxPercent: number) {
  const subtotal = lines.reduce((sum, line) => sum + lineTotal(line), 0);
  const tax = Math.round((subtotal * Math.max(0, taxPercent)) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export function quoteNumber(index: number, when = new Date()) {
  const year = when.getUTCFullYear();
  const n = String(index + 1).padStart(3, "0");
  return `PRE-${year}-${n}`;
}

export function validUntil(days: number, when = new Date()) {
  const date = new Date(
    Date.UTC(
      when.getUTCFullYear(),
      when.getUTCMonth(),
      when.getUTCDate() + Math.max(1, days),
    ),
  );
  return `${date.getUTCDate()} de ${MONTHS_ES[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
}
