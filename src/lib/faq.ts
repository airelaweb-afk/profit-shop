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
    a: "Sí. En Unir PDF eliges los archivos, los ordenas y descargas uno solo. No hace falta cuenta. Gratis: 5 PDF de 20 MB. Pro quita el tope.",
    href: "/unir-pdf",
  },
  {
    q: "¿Por qué no convertís PDF a Word?",
    a: "Sin un motor de maquetación en un servidor el .docx sale desordenado. No cobramos un Word feo. Mientras tanto une, comprime o firma el PDF.",
    href: "/blog/por-que-no-convertimos-pdf-a-word/",
  },
  {
    q: "¿Puedo rellenar las casillas reales de un PDF?",
    a: "Sí, si el archivo trae campos de formulario (AcroForm). Rellenar PDF escribe dentro de esas cajas y el PDF sigue siendo un formulario. Un escaneo o un PDF ‘impreso’ no tiene campos: no se pueden inventar. En ese caso usa Firmar PDF y marcas encima.",
    href: "/rellenar-pdf",
  },
  {
    q: "¿Puedo cambiar el texto de un PDF que no es formulario, como iLove?",
      a: "Sí, en Editar texto PDF, si el archivo tiene letras seleccionables. Pulsas la frase, la cambias y al guardar se tapa la vieja y se escribe la nueva, reutilizando la fuente TTF si venía en el PDF. Un escaneo se lee con OCR en este navegador (revisa el resultado).",
    href: "/editar-pdf",
  },
  {
    q: "¿Es una firma digital de la FNMT o Cl@ve?",
    a: "No. Es tu rúbrica dibujada, como en papel. Sirve para un parte o una autorización informal. No sustituye el certificado cualificado.",
    href: "/pdf",
  },
  {
    q: "¿Qué es Pro?",
    a: "Pro quita los límites (archivos, peso, cupo diario) y abre marca de agua, WebP en lote y el plugin de WordPress. 7 € al mes o 40 € al año. Pagas con Stripe o Revolut.",
    href: "/precios",
  },
  {
    q: "¿Por qué aparecen nombres de otros conversores?",
    a: "Porque mucha gente busca unir o comprimir PDF escribiendo el nombre de un producto conocido. En España se puede comparar de forma objetiva (Ley 3/1991 art. 10, Ley 17/2001, STS 105/2016) si no nos hacemos pasar por ellos, no usamos su logo y no llamamos a nuestro producto «Alternativa + su marca». El nuestro se llama Luna Oficio. Las fichas están en Comparar.",
    href: "/comparar",
  },
  {
    q: "¿Usáis cookies de publicidad?",
    a: "No. No hay anuncios. Solo cookies necesarias (sesión, consentimiento y, si activas Pro, la clave).",
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
      a: "Gratis: 5 PDF de 20 MB. Pro, sin ese tope. Si son más, une en tandas o pasa a Pro.",
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
      a: "Sí, como marcas encima. Amplía con + y pon checks grandes en el teléfono. Si el modelo trae campos de formulario, usa Rellenar PDF.",
    },
  ],
  "/rellenar-pdf": [
    {
      q: "¿Cualquier PDF se puede hacer editable?",
      a: "No. Solo los que ya traen campos (AcroForm). Un escaneo, una foto o un PDF exportado como imagen no tiene cajas reales. No las inventamos pintando texto: eso sería mentir. Esos van a Firmar PDF. Si el PDF tiene texto seleccionable (un cartel, un contrato), usa Editar texto PDF.",
    },
    {
      q: "¿El PDF sigue siendo un formulario al descargarlo?",
      a: "Sí. Escribimos en los campos originales y no aplanamos el formulario. Lo puedes seguir editando en Acrobat u otro visor.",
    },
    {
      q: "¿Por qué salían todas las casillas con una X?",
      a: "Eso era un fallo del visor: pintaba el dibujo de «marcado» de cada casilla aunque el PDF original estuviera en blanco. Ahora solo se ve la X si tú la marcas, y al guardar no se escriben cruces que no hayas puesto.",
    },
  ],
  "/editar-pdf": [
    {
      q: "¿Esto es lo mismo que Rellenar PDF?",
      a: "No. Rellenar PDF escribe en casillas de formulario. Editar texto cambia frases que ya están dibujadas en la página, como el «Editar texto» de iLove. Hace falta que el PDF tenga texto seleccionable.",
    },
    {
      q: "¿Queda la misma fuente y el mismo diseño?",
      a: "Si el PDF trae la fuente embebida en TTF u OpenType, la reutilizamos al guardar. En el panel de estilos puedes cambiar tamaño, negrita, color y subrayado. La cursiva solo se guarda con Helvetica. Helvetica de las 14 estándar no es un archivo de fuente. No clonamos Type1 ni texto en curva. El diseño no se recompone como Word: tapamos la frase vieja y escribimos encima.",
    },
    {
      q: "¿El archivo se sube, como en iLove?",
      a: "No. El PDF se lee y se guarda en este navegador. El OCR descarga un modelo de español (unos megas) la primera vez; eso no es tu documento.",
    },
    {
      q: "¿Cómo leéis un escaneo sin servidor?",
      a: "Con Tesseract en el propio navegador, página a página. Es más lento y menos fino que el OCR de iLove en sus servidores. Revisa el texto antes de guardar. Si falla, Firmar PDF deja escribir encima de la foto.",
    },
  ],
  "/marca-de-agua-pdf": [
    {
      q: "¿La marca de agua es Pro?",
      a: "Sí. Unir, comprimir y firmar siguen gratis (con tope). Pro quita el tope y abre WebP en lote.",
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
