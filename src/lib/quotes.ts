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
  address: string;
  city: string;
  website: string;
  logoDataUrl: string;
  conditions: string;
  intro: string;
  taxPercent: number;
  validDays: number;
  quotePrefix: string;
  quoteStart: number;
};

export type ServiceLine = {
  id: string;
  name: string;
  detail?: string;
  quantity: number;
  price: number;
};

export type ClientRow = {
  company: string;
  contact: string;
  email: string;
};

export const blankIssuer: Issuer = {
  name: "",
  taxId: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  website: "",
  logoDataUrl: "",
  conditions:
    "Forma de pago: 50 % al aceptar y 50 % contra entrega.\nRevisiones: dos rondas incluidas. Los cambios de alcance se presupuestan aparte.\nAceptación: responda a este documento por correo con “aceptado” o fírmelo más abajo.",
  intro:
    "Gracias por su interés. A continuación, el detalle de los servicios, plazos e importes.",
  taxPercent: 21,
  validDays: 14,
  quotePrefix: "PRE",
  quoteStart: 1,
};

export const sampleIssuer: Issuer = {
  ...blankIssuer,
  name: "Estudio Clara López",
  taxId: "12345678Z",
  email: "clara@estudio.com",
  phone: "+34 600 000 000",
  address: "Carrer de la Pau 18, 2º",
  city: "46001 Valencia",
  website: "estudioclara.es",
};

export const sampleServices: ServiceLine[] = [
  {
    id: "svc-redes",
    name: "Dirección de redes · 4 semanas",
    detail:
      "Calendario, copys, publicación y un informe breve al cierre. Reuniones de 20 min cada lunes.",
    quantity: 1,
    price: 45000,
  },
  {
    id: "svc-estrategia",
    name: "Sesión de estrategia (90 min)",
    detail: "Diagnóstico, prioridades del trimestre y un documento de acuerdos.",
    quantity: 1,
    price: 12000,
  },
  {
    id: "svc-feed",
    name: "Diseño de 8 piezas para feed",
    detail: "Formatos 1:1 y 4:5, textos colocados, exportadas listas para publicar.",
    quantity: 8,
    price: 2500,
  },
];

export const emptyServices: ServiceLine[] = [
  { id: "svc-1", name: "", detail: "", quantity: 1, price: 0 },
];

export const sampleClientText = `Academia Norte, Marta Gil, marta@norte.com
Taller Sur, Diego Paredes, diego@tallersur.es
Clínica Alma, Noelia Castro
Estudio Pino
Residencia El Olivo, Administración, admin@elolivo.es`;

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

export function formatLongDate(when = new Date()) {
  return `${when.getUTCDate()} de ${MONTHS_ES[when.getUTCMonth()]} de ${when.getUTCFullYear()}`;
}

export function quoteNumber(
  index: number,
  options: { when?: Date; prefix?: string; start?: number } = {},
) {
  const when = options.when ?? new Date();
  const year = when.getUTCFullYear();
  const start = Math.max(1, Math.round(options.start ?? 1));
  const n = String(start + index).padStart(3, "0");
  const prefix =
    (options.prefix ?? "PRE").replace(/[^A-Za-z0-9-]/g, "").slice(0, 12) ||
    "PRE";
  return `${prefix}-${year}-${n}`;
}

export function validUntil(days: number, when = new Date()) {
  const date = new Date(
    Date.UTC(
      when.getUTCFullYear(),
      when.getUTCMonth(),
      when.getUTCDate() + Math.max(1, days),
    ),
  );
  return formatLongDate(date);
}

export function quoteSendMessage({
  issuer,
  client,
  number,
  total,
  valid,
}: {
  issuer: Issuer;
  client: ClientRow;
  number: string;
  total: number;
  valid: string;
}) {
  const first = client.contact.trim().split(/\s+/)[0];
  const hello = first ? `Hola ${first}` : `Hola`;
  const sign = [issuer.name, issuer.phone, issuer.email]
    .filter(Boolean)
    .join("\n");
  return `${hello},

Te envío el presupuesto ${number} de ${issuer.name || "mi estudio"} para ${client.company}.
Total: ${formatEuro(total)} (IVA ${issuer.taxPercent} % incluido).
Válido hasta el ${valid}.

El PDF va adjunto. Si te encaja, responde a este mensaje con “aceptado”.

Un saludo,
${sign}`;
}
