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
  {
    href: "/rellenar-pdf",
    slug: "fill" as const,
    name: "Rellenar PDF",
    problem: "El PDF ya trae casillas y no quiero escribir encima.",
    does: "Rellenas los campos originales. Un escaneo no tiene campos.",
    search: "rellenar pdf",
  },
  {
    href: "/editar-pdf",
    slug: "edit" as const,
    name: "Editar texto PDF",
    problem: "El cartel o el contrato no es un formulario y quiero cambiar una frase.",
    does: "Pulsa el texto de la página, lo cambias y lo descargas. Un escaneo no tiene texto.",
    search: "editar pdf",
  },
] as const;

export type PdfKitSlug = (typeof pdfKit)[number]["slug"];

export const pdfExtraKit = [
  {
    href: "/rotar-pdf",
    slug: "rotate" as const,
    name: "Rotar PDF",
    problem: "El escaneo ha salido de lado y el cliente lo ve torcido.",
    does: "Giras todas las páginas 90, 180 o 270 grados.",
    search: "rotar pdf",
    pro: false,
  },
  {
    href: "/numerar-pdf",
    slug: "numbers" as const,
    name: "Numerar PDF",
    problem: "El contrato no lleva número de página y el gestor se pierde.",
    does: "Pone el número al pie, en este navegador.",
    search: "numerar pdf",
    pro: false,
  },
  {
    href: "/eliminar-paginas-pdf",
    slug: "remove" as const,
    name: "Eliminar páginas PDF",
    problem: "Sobran la portada en blanco y dos hojas del medio.",
    does: "Escribes las páginas a quitar (2, 5-7) y descargas el PDF limpio.",
    search: "eliminar paginas pdf",
    pro: false,
  },
  {
    href: "/marca-de-agua-pdf",
    slug: "watermark" as const,
    name: "Marca de agua PDF",
    problem: "Quiero que ponga BORRADOR o CONFIDENCIAL encima.",
    does: "Texto en diagonal en cada hoja. Herramienta Pro.",
    search: "marca de agua pdf",
    pro: true,
  },
] as const;

export type PdfExtraSlug = (typeof pdfExtraKit)[number]["slug"];

export const allPdfTools = [...pdfKit, ...pdfExtraKit];
