export type Competitor = {
  slug: string;
  name: string;
  holder: string;
  href: string;
  search: string;
  title: string;
  meta: string;
  keywords: string[];
  facts: { ours: string; theirs: string; label: string }[];
};

export const competitors: Competitor[] = [
  {
    slug: "ilovepdf",
    name: "iLovePDF",
    holder: "iLovePDF es una marca de terceros. No es nuestra.",
    href: "/alternativa-a-ilovepdf",
    search: "unir pdf, comprimir pdf, jpg a pdf",
    title: "Unir PDF sin subirlo (comparativa objetiva con iLovePDF)",
    meta: "Unir y comprimir PDF en el navegador, sin subir el archivo. Comparativa objetiva con iLovePDF (marca ajena). Luna Oficio no está afiliada.",
    keywords: [
      "unir pdf sin subir",
      "comprimir pdf navegador",
      "alternativa a ilovepdf",
      "juntar pdf gratis",
    ],
    facts: [
      {
        label: "Dónde se procesa el PDF",
        ours: "En tu navegador, en este aparato.",
        theirs: "En sus servidores: el archivo viaja a internet.",
      },
      {
        label: "Unir, comprimir, JPG ↔ PDF",
        ours: "Sí, gratis con cuenta local.",
        theirs: "Sí; el documento se sube.",
      },
      {
        label: "PDF a Word",
        ours: "No. Sin motor de maquetación el .docx queda mal y no lo fingimos.",
        theirs: "Sí, subiendo el archivo a su motor.",
      },
      {
        label: "Cuenta y datos",
        ours: "localStorage. Si cambias de teléfono, se pierde.",
        theirs: "Cuenta en su nube.",
      },
    ],
  },
  {
    slug: "smallpdf",
    name: "Smallpdf",
    holder: "Smallpdf es una marca de terceros. No es nuestra.",
    href: "/alternativa-a-smallpdf",
    search: "comprimir pdf, unir pdf, firmar pdf",
    title: "Comprimir PDF en el navegador (comparativa objetiva con Smallpdf)",
    meta: "Comprimir y unir PDF en el navegador. Comparativa objetiva con Smallpdf (marca ajena). No estamos afiliados.",
    keywords: [
      "comprimir pdf sin subir",
      "unir pdf navegador",
      "alternativa a smallpdf",
    ],
    facts: [
      {
        label: "Dónde se procesa el PDF",
        ours: "En tu navegador.",
        theirs: "En la nube de Smallpdf.",
      },
      {
        label: "Límites y pago",
        ours: "Unir, comprimir y firmar gratis; Pro quita anuncios y añade marca de agua, WebP en lote y plugin de WordPress.",
        theirs: "Plan gratuito con límites; suscripción para el resto.",
      },
      {
        label: "PDF a Word",
        ours: "No está. Lo decimos en la ficha.",
        theirs: "Sí, en servidor.",
      },
    ],
  },
  {
    slug: "pdf24",
    name: "PDF24",
    holder: "PDF24 es una marca de terceros. No es nuestra.",
    href: "/alternativa-a-pdf24",
    search: "unir pdf, herramientas pdf gratis",
    title: "Herramientas PDF en el navegador (comparativa objetiva con PDF24)",
    meta: "Herramientas PDF que funcionan en el navegador, sin subir el archivo. Comparativa objetiva con PDF24 (marca ajena).",
    keywords: [
      "herramientas pdf navegador",
      "unir pdf gratis",
      "alternativa a pdf24",
    ],
    facts: [
      {
        label: "Dónde corre",
        ours: "Solo este navegador. Nada se envía a un servidor nuestro.",
        theirs: "Ofrece herramientas online y de escritorio; el online implica red.",
      },
      {
        label: "Enfoque",
        ours: "Lo más buscado: unir, comprimir, HEIC a JPG, WebP, y documentos de trabajo en PDF.",
        theirs: "Suite amplia de conversión.",
      },
      {
        label: "Idioma y oficio",
        ours: "Copy en español de despacho. Importes a la española.",
        theirs: "Productos generalistas.",
      },
    ],
  },
  {
    slug: "iloveimg",
    name: "iLoveIMG",
    holder: "iLoveIMG es una marca de terceros. No es nuestra.",
    href: "/alternativa-a-iloveimg",
    search: "comprimir imagen, heic a jpg, png a jpg",
    title: "Comprimir imagen en el navegador (comparativa objetiva con iLoveIMG)",
    meta: "Comprimir foto, HEIC a JPG y PNG a JPG en el navegador. Comparativa objetiva con iLoveIMG (marca ajena). Luna Oficio no está afiliada.",
    keywords: [
      "comprimir imagen sin subir",
      "heic a jpg navegador",
      "alternativa a iloveimg",
    ],
    facts: [
      {
        label: "Dónde se procesa la foto",
        ours: "En tu navegador.",
        theirs: "En sus servidores.",
      },
      {
        label: "HEIC del iPhone",
        ours: "Sí, con decodificador local (tarda la primera vez).",
        theirs: "Conversión en la nube.",
      },
      {
        label: "Quitar fondo / IA",
        ours: "No. Pide servidor y no lo fingimos.",
        theirs: "Herramientas de edición en servidor.",
      },
    ],
  },
  {
    slug: "adobe-acrobat",
    name: "Adobe Acrobat",
    holder: "Adobe Acrobat es una marca de Adobe. No es nuestra.",
    href: "/alternativa-a-adobe-acrobat",
    search: "comprimir pdf, firmar pdf, unir pdf",
    title: "Unir y comprimir PDF sin Adobe Acrobat",
    meta: "Une, comprime y firma PDF en el navegador, sin instalar Acrobat ni subir el archivo. Comparativa objetiva. No estamos afiliados a Adobe.",
    keywords: [
      "unir pdf sin adobe",
      "comprimir pdf sin acrobat",
      "firmar pdf sin adobe",
      "alternativa a adobe acrobat",
    ],
    facts: [
      {
        label: "Instalación",
        ours: "Ninguna. Abres la página.",
        theirs: "Programa de escritorio o cuenta Adobe.",
      },
      {
        label: "Precio del uso diario",
        ours: "Unir y comprimir gratis. Pro 29 €/año (sin anuncios, marca de agua, WebP en lote, plugin WordPress).",
        theirs: "Licencia o suscripción de Adobe.",
      },
      {
        label: "PDF a Word profesional",
        ours: "No. Lo decimos: sin motor de maquetación queda mal.",
        theirs: "Sí, en su ecosistema.",
      },
    ],
  },
  {
    slug: "sejda",
    name: "Sejda",
    holder: "Sejda es una marca de terceros. No es nuestra.",
    href: "/alternativa-a-sejda",
    search: "unir pdf, comprimir pdf, firmar pdf",
    title: "Unir PDF en el navegador (comparativa objetiva con Sejda)",
    meta: "Unir y comprimir PDF en tu aparato. Comparativa objetiva con Sejda (marca ajena). No afiliados.",
    keywords: ["unir pdf navegador", "alternativa a sejda", "pdf sin subir"],
    facts: [
      {
        label: "Dónde corre el archivo",
        ours: "Este navegador.",
        theirs: "Sus servidores (con límites del plan gratis).",
      },
      {
        label: "Cuenta",
        ours: "Local, en este aparato.",
        theirs: "Cuenta en su web si quieres más tareas.",
      },
    ],
  },
  {
    slug: "pdf-candy",
    name: "PDF Candy",
    holder: "PDF Candy es una marca de terceros. No es nuestra.",
    href: "/alternativa-a-pdf-candy",
    search: "unir pdf, jpg a pdf, comprimir pdf",
    title: "Juntar PDF sin subirlo (comparativa objetiva con PDF Candy)",
    meta: "Juntar y comprimir PDF en el navegador. Comparativa objetiva con PDF Candy (marca ajena).",
    keywords: [
      "juntar pdf sin subir",
      "alternativa a pdf candy",
      "pdf en el navegador",
    ],
    facts: [
      {
        label: "El archivo",
        ours: "No sale de este aparato.",
        theirs: "Se envía a su servicio online.",
      },
      {
        label: "Documentos de trabajo",
        ours: "Además: presupuestos, avisos de cobro, partes de horas, gastos y HEIC a JPG.",
        theirs: "Suite de conversión generalista.",
      },
    ],
  },
];

export function getCompetitor(slug: string) {
  return competitors.find((item) => item.slug === slug);
}
