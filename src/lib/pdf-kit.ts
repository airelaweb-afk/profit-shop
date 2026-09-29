export const pdfKit = [
  {
    href: "/unir-pdf",
    slug: "merge" as const,
    name: "Unir PDF",
    problem: "Tengo tres PDFs y el cliente quiere uno solo.",
    does: "Los juntas en el orden que elijas y te descargas el resultado.",
    search: "unir pdf",
  },
  {
    href: "/dividir-pdf",
    slug: "split" as const,
    name: "Dividir PDF",
    problem: "El archivo tiene 40 páginas y solo necesito tres.",
    does: "Extraes un rango o un PDF por página.",
    search: "dividir pdf",
  },
  {
    href: "/comprimir-pdf",
    slug: "compress" as const,
    name: "Comprimir PDF",
    problem: "Pesa 18 MB y no entra en el correo.",
    does: "Lo aligeras aquí. El fuerte convierte páginas en imagen.",
    search: "comprimir pdf",
  },
  {
    href: "/jpg-a-pdf",
    slug: "images" as const,
    name: "JPG a PDF",
    problem: "Fotos del DNI o del ticket, y las quieren en un PDF.",
    does: "Varias imágenes, un PDF A4. JPG o PNG.",
    search: "jpg a pdf",
  },
  {
    href: "/pdf-a-jpg",
    slug: "to-images" as const,
    name: "PDF a JPG",
    problem: "Necesito cada hoja como foto para el WhatsApp.",
    does: "Cada página sale en un JPG, en un zip.",
    search: "pdf a jpg",
  },
  {
    href: "/pdf",
    slug: "sign" as const,
    name: "Firmar PDF",
    problem: "Me mandan un PDF y no tengo Adobe.",
    does: "Marcas casillas, escribes, firmas y te lo llevas.",
    search: "firmar pdf",
  },
] as const;

export type PdfKitSlug = (typeof pdfKit)[number]["slug"];
