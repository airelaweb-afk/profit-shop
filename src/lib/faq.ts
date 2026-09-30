import { hasCloud } from "@/lib/supabase";

export type FaqItem = {
  q: string;
  a: string;
  href?: string;
};

const cloud = hasCloud();

export const siteFaqs: FaqItem[] = [
  {
    q: "¿Se suben mis PDF o fotos a un servidor?",
    a: cloud
      ? "No. Unir, comprimir, convertir y firmar se hace en tu navegador: el archivo nunca sale de tu aparato. Lo único que guardamos en nuestra base de datos es tu cuenta (correo y si eres Pro), para que entres desde cualquier dispositivo."
      : "No. Unir, comprimir, convertir y firmar se hace en este navegador. La cuenta también vive aquí (localStorage). Si cambias de teléfono, hay que crear la cuenta otra vez.",
  },
  {
    q: "¿Puedo unir PDF gratis y sin subir el archivo?",
    a: "Sí. En Unir PDF eliges los archivos, los ordenas y descargas uno solo. Hace falta una cuenta gratuita, no una suscripción. El PDF no viaja a un servidor nuestro.",
    href: "/unir-pdf",
  },
  {
    q: "¿Por qué no convertís PDF a Word?",
    a: "Sin un motor de maquetación en un servidor el .docx sale desordenado. No cobramos un Word feo. Mientras tanto une, comprime o firma el PDF.",
    href: "/blog/por-que-no-convertimos-pdf-a-word/",
  },
  {
    q: "¿Es una firma digital de la FNMT o Cl@ve?",
    a: "No. Es tu rúbrica dibujada, como en papel. Sirve para un parte o una autorización informal. No sustituye el certificado cualificado.",
    href: "/pdf",
  },
  {
    q: "¿Qué es Pro?",
    a: cloud
      ? "29 € al año: sin anuncios, marca de agua en PDF, conversión de imágenes a WebP en lote y el plugin de WordPress para pasar toda la biblioteca de medios a WebP. Pagas con Stripe (tarjeta) o Revolut y se activa en tu cuenta."
      : "29 € al año: sin anuncios, marca de agua en PDF, conversión de imágenes a WebP en lote y el plugin de WordPress para pasar toda la biblioteca de medios a WebP. Pagas con Stripe (tarjeta) o Revolut; la clave se guarda en este navegador.",
    href: "/precios",
  },
  {
    q: "¿Por qué aparecen nombres de otros conversores?",
    a: "Porque mucha gente busca unir o comprimir PDF escribiendo el nombre de un producto conocido. En España se puede comparar de forma objetiva (Ley 3/1991 art. 10, Ley 17/2001, STS 105/2016) si no nos hacemos pasar por ellos, no usamos su logo y no llamamos a nuestro producto «Alternativa + su marca». El nuestro se llama Luna Oficio. Las fichas están en Comparar.",
    href: "/comparar",
  },
  {
    q: "¿Usáis cookies de publicidad?",
    a: "Solo si pulsas Aceptar publicidad. Hasta que haya AdSense el hueco es nuestro (casa). Las necesarias son la cuenta, el consentimiento y la clave Pro.",
    href: "/cookies",
  },
  {
    q: "La foto del iPhone no se abre en Windows. ¿Qué hago?",
    a: "Es HEIC. Pásala a JPG en HEIC a JPG. La primera vez tarda un poco: carga el decodificador en este aparato.",
    href: "/heic-a-jpg",
  },
  {
    q: "El PDF pesa 18 MB y Gmail lo corta. ¿Cómo lo bajo?",
    a: "Comprimir PDF: prueba ligera (mantiene el texto) y, si sigue gordo, fuerte (páginas como foto). No es Adobe; para un escaneo suele bastar.",
    href: "/comprimir-pdf",
  },
];

export const toolFaqs: Record<string, FaqItem[]> = {
  "/unir-pdf": [
    {
      q: "¿Cuántos PDF puedo juntar?",
      a: "Hasta 15 archivos y 20 MB cada uno. Si son más, une en tandas.",
    },
    {
      q: "¿Se mantiene el orden?",
      a: "El de la lista. Súbelos o bájalo con las flechas antes de unir.",
    },
  ],
  "/comprimir-pdf": [
    {
      q: "¿La compresión ligera siempre baja el peso?",
      a: "No. Si el PDF ya está bien hecho, casi no adelgaza. Entonces usa la fuerte.",
    },
    {
      q: "¿Puedo seleccionar el texto después de la fuerte?",
      a: "No. Cada página pasa a foto. Copia el original si te hace falta el texto.",
    },
  ],
  "/heic-a-jpg": [
    {
      q: "¿Funciona en el iPhone?",
      a: "Sí. Elige las fotos del carrete. En iOS, al guardar se abre compartir: Guardar en Archivos.",
    },
  ],
  "/pdf": [
    {
      q: "¿Vale para un modelo 145?",
      a: "Sí, como marcas encima. Amplía con + y pon checks grandes en el teléfono.",
    },
  ],
  "/marca-de-agua-pdf": [
    {
      q: "¿La marca de agua es Pro?",
      a: "Sí. El resto de unir, comprimir y firmar sigue gratis. Pro también quita anuncios y abre WebP en lote.",
    },
  ],
  "/eliminar-paginas-pdf": [
    {
      q: "¿Cómo indico las páginas que quiero quitar?",
      a: "Con números y rangos separados por comas: 1, 4-6, 9. El resto de páginas se conserva en su orden.",
    },
    {
      q: "¿Se pierde calidad al eliminar páginas?",
      a: "No. Las páginas que quedan se copian tal cual, con su texto y sus imágenes.",
    },
  ],
  "/webp-en-lote": [
    {
      q: "¿Cuántas imágenes puedo convertir de una vez?",
      a: "Hasta 300 por tanda, o una carpeta entera. Se procesan una a una en tu navegador y se descargan en un zip con los mismos nombres y extensión .webp.",
    },
    {
      q: "¿Y si el WebP pesa más que el original?",
      a: "Pasa con algunos PNG muy simples. Por defecto, en ese caso el zip incluye el original sin tocar, para que nunca empeores un archivo.",
    },
    {
      q: "¿Qué calidad y qué ancho uso para una web?",
      a: "Calidad 80 y ancho máximo 1600 px es un buen punto de partida para fotos de contenido. Para imágenes de cabecera, 1920 px.",
    },
  ],
  "/plugin-wordpress-webp": [
    {
      q: "¿Qué necesita el plugin?",
      a: "WordPress 5.8 o superior y PHP 7.4 o superior con la librería GD o Imagick con soporte WebP (lo normal en cualquier hosting actual). El propio plugin te avisa si falta.",
    },
    {
      q: "¿Borra mis imágenes originales?",
      a: "Solo si tú lo marcas. Por defecto conserva los JPG y PNG en el servidor y cambia los adjuntos a WebP; puedes restaurarlos desde la misma pantalla.",
    },
    {
      q: "¿Sirve para las imágenes que ya tengo subidas?",
      a: "Sí. Tiene un conversor de biblioteca por lotes que recorre todos los adjuntos JPG y PNG, también sus miniaturas, y actualiza las URL en las entradas.",
    },
  ],
};

export function faqsForPath(path: string): FaqItem[] {
  return toolFaqs[path] ?? [];
}
