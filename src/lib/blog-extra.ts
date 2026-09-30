import type { BlogPost } from "@/lib/blog-types";

export const extraPosts: BlogPost[] = [
  {
    slug: "dividir-pdf-extraer-paginas",
    title: "Dividir un PDF y quedarte solo con las páginas que piden",
    meta: "Extrae un rango (1-3, 5) o un PDF por hoja. En el navegador, sin subir el archivo. Guía para autónomos.",
    kicker: "Dividir PDF",
    date: "2026-09-30",
    keywords: [
      "dividir pdf",
      "extraer paginas pdf",
      "separar pdf",
      "partir pdf por paginas",
    ],
    toolHref: "/dividir-pdf",
    blocks: [
      {
        type: "p",
        text: "Te mandan un dossier de 40 hojas y el cliente solo quiere el anexo. “Dividir PDF” y “extraer páginas” se buscan cada día. Aquí no subes el archivo: eliges un rango o un PDF por página.",
      },
      {
        type: "h2",
        text: "Rango o un archivo por hoja",
      },
      {
        type: "ul",
        items: [
          "Rango: 1-3, 5, 8-10. Sale un PDF con esas hojas, en ese orden.",
          "Un PDF por página: te bajas un zip. Útil si cada hoja va a un sitio distinto.",
        ],
      },
      {
        type: "cta",
        href: "/dividir-pdf",
        label: "Dividir PDF",
        text: "El original no se envía a ningún servidor nuestro. Si pesa más de 20 MB, comprímelo antes.",
      },
    ],
  },
  {
    slug: "pdf-a-jpg-para-whatsapp",
    title: "Pasar un PDF a JPG para mandarlo por WhatsApp",
    meta: "Cada página del PDF sale en un JPG, en un zip. En el navegador. Ideal para grupos de WhatsApp que no abren PDF.",
    kicker: "PDF a JPG",
    date: "2026-09-30",
    keywords: ["pdf a jpg", "pdf a imagen", "pasar pdf a foto whatsapp"],
    toolHref: "/pdf-a-jpg",
    blocks: [
      {
        type: "p",
        text: "El grupo del trabajo no abre PDFs. Te piden “mándalo en foto”. PDF a JPG pinta cada hoja y te da un zip. No es OCR: no convierte el texto en editable; es la foto de la página.",
      },
      {
        type: "p",
        text: "Si el PDF es largo, parte primero un rango. Más de 60 páginas en el móvil se atasca: no es que se haya colgado, es este aparato pintando.",
      },
      {
        type: "cta",
        href: "/pdf-a-jpg",
        label: "PDF a JPG",
        text: "Elige el PDF, espera, descarga el zip. En el teléfono: Guardar en Archivos y luego comparte las fotos.",
      },
    ],
  },
  {
    slug: "rotar-pdf-escaneo-de-lado",
    title: "Rotar un PDF cuando el escaneo ha salido de lado",
    meta: "Gira todas las páginas de un PDF 90, 180 o 270 grados en el navegador. Sin Adobe y sin subir el archivo.",
    kicker: "Rotar PDF",
    date: "2026-09-30",
    keywords: ["rotar pdf", "girar pdf", "pdf boca abajo", "enderezar pdf"],
    toolHref: "/rotar-pdf",
    blocks: [
      {
        type: "p",
        text: "El alimentador del escáner ha tragado el contrato de lado. El cliente lo abre en el móvil y tiene que torcer el cuello. Rotar PDF gira todas las hojas a la vez.",
      },
      {
        type: "ul",
        items: [
          "90° si está de canto.",
          "180° si está boca abajo.",
          "270° si el canto es el otro.",
        ],
      },
      {
        type: "cta",
        href: "/rotar-pdf",
        label: "Rotar PDF",
        text: "Gratis, en este navegador. Si solo está torcida una foto suelta, usa Girar imagen.",
      },
    ],
  },
  {
    slug: "numerar-paginas-de-un-pdf",
    title: "Numerar las páginas de un PDF para el gestor o el notario",
    meta: "Añade el número al pie de cada hoja. En el navegador, sin Adobe Acrobat. El archivo no se sube.",
    kicker: "Numerar PDF",
    date: "2026-09-30",
    keywords: [
      "numerar pdf",
      "numero de pagina pdf",
      "añadir paginas a pdf",
    ],
    toolHref: "/numerar-pdf",
    blocks: [
      {
        type: "p",
        text: "Un contrato de 12 hojas sin número es un lío cuando alguien dice “mira la 7”. Numerar PDF pone el dígito al pie, centrado. Puedes empezar en 1 o en otro número si es un anexo.",
      },
      {
        type: "p",
        text: "No mueve el contenido: dibuja encima. Si abajo ya hay un pie muy bajo, revisa el PDF antes de mandarlo.",
      },
      {
        type: "cta",
        href: "/numerar-pdf",
        label: "Numerar PDF",
        text: "Elige el archivo, el número de arranque y descarga. Nada viaja a un servidor nuestro.",
      },
    ],
  },
  {
    slug: "marca-de-agua-borrador-en-pdf",
    title: "Poner BORRADOR o CONFIDENCIAL en un PDF (marca de agua)",
    meta: "Marca de agua en diagonal en cada página. Herramienta Pro de Luna Oficio. El PDF no se sube.",
    kicker: "Marca de agua",
    date: "2026-09-30",
    keywords: [
      "marca de agua pdf",
      "pdf borrador",
      "confidencial pdf",
      "watermark pdf",
    ],
    toolHref: "/marca-de-agua-pdf",
    blocks: [
      {
        type: "p",
        text: "Mandas un presupuesto y no quieres que lo tomen por factura. O un contrato en revisión. La marca de agua (BORRADOR, COPIA, CONFIDENCIAL) se entiende en un segundo.",
      },
      {
        type: "p",
        text: "Es una herramienta Pro: 29 € al año en este navegador, sin anuncios. Unir, comprimir y firmar siguen gratis. El texto se pinta en tu aparato; el archivo no sale.",
      },
      {
        type: "cta",
        href: "/marca-de-agua-pdf",
        label: "Marca de agua PDF",
        text: "Si aún no tienes Pro, la página te explica cómo activar la clave. Los datos de pago no se guardan aquí.",
      },
    ],
  },
  {
    slug: "redimensionar-foto-para-avatar-y-sede",
    title: "Redimensionar una foto a 400 px o al ancho que pide la sede",
    meta: "Cambia el tamaño de una imagen en el navegador, manteniendo la proporción. Sin subir la foto.",
    kicker: "Redimensionar",
    date: "2026-09-30",
    keywords: [
      "redimensionar imagen",
      "cambiar tamaño foto",
      "foto 400 pixeles",
      "reducir resolucion imagen",
    ],
    toolHref: "/redimensionar-imagen",
    blocks: [
      {
        type: "p",
        text: "El avatar pide 400 px. La sede pide “máximo 1600 de ancho”. La foto del DNI sale a 4000. Redimensionar no es comprimir: cambia los píxeles. Luego, si aún pesa, comprime.",
      },
      {
        type: "p",
        text: "No ampliamos con IA. Si pones 4000 px a una foto de 800, se ve borrosa. Para agrandar de verdad haría falta un servidor; aquí no lo fingimos.",
      },
      {
        type: "cta",
        href: "/redimensionar-imagen",
        label: "Redimensionar imagen",
        text: "Fijas ancho o alto. Por defecto se mantiene la proporción.",
      },
    ],
  },
  {
    slug: "recortar-foto-dni-para-sede-electronica",
    title: "Recortar la foto del DNI para que la sede no la tire",
    meta: "Recorta JPG o PNG en el navegador. Marca el recuadro del DNI, el ticket o la captura. Sin subir el archivo.",
    kicker: "Recortar imagen",
    date: "2026-09-30",
    keywords: [
      "recortar imagen",
      "recortar foto dni",
      "crop imagen online",
      "recortar captura pantalla",
    ],
    toolHref: "/recortar-imagen",
    blocks: [
      {
        type: "p",
        text: "La sede quiere “solo el anverso”. Tú tienes la foto de la mesa con el café. Recortar imagen: marcas el recuadro, descargas. En el teléfono el recorte no mueve la página.",
      },
      {
        type: "p",
        text: "Después suele hacer falta comprimir (máximo 1 MB) o pasar a JPG. El orden que funciona: recortar → redimensionar si pide píxeles → comprimir.",
      },
      {
        type: "cta",
        href: "/recortar-imagen",
        label: "Recortar imagen",
        text: "Pulsa y arrastra. Si pulsas dentro del recuadro, lo mueves. El archivo no sale de aquí.",
      },
    ],
  },
  {
    slug: "jpg-a-webp-para-que-la-web-pese-menos",
    title: "Pasar JPG a WebP para que la web cargue antes",
    meta: "Convierte JPG o PNG a WebP en el navegador. Suele pesar menos. Si el cliente no abre WebP, quédate en JPG.",
    kicker: "JPG a WebP",
    date: "2026-09-30",
    keywords: ["jpg a webp", "convertir a webp", "imagen webp peso"],
    toolHref: "/jpg-a-webp",
    blocks: [
      {
        type: "p",
        text: "Una ficha de producto en JPG a 2 MB frena la tienda. WebP suele bajar sin que se note. “JPG a WebP” es la búsqueda de quien monta una web o un catálogo.",
      },
      {
        type: "p",
        text: "Outlook y algún gestor antiguo no abren WebP. Para un correo, JPG. Para la web, WebP. Aquí conviertes en el navegador, sin CDN de por medio.",
      },
      {
        type: "cta",
        href: "/jpg-a-webp",
        label: "JPG a WebP",
        text: "Elige las fotos y descarga. Si el programa del cliente falla, usa PNG a JPG.",
      },
    ],
  },
  {
    slug: "parte-de-horas-sin-fichaje",
    title: "Hacer un parte de horas de la semana sin un reloj de fichar",
    meta: "Pegas lo que hiciste, ves el total y sales con un PDF para el cliente o el jefe. En el navegador.",
    kicker: "Horas",
    date: "2026-09-30",
    keywords: [
      "parte de horas",
      "plantilla horas autonomo",
      "registro horario semana",
      "horas trabajadas pdf",
    ],
    toolHref: "/horas",
    blocks: [
      {
        type: "p",
        text: "No es el fichaje de la reforma laboral. Es el papel del viernes: “lunes 3 h de visita, martes 5 de taller”. El cliente o el jefe lo entienden. Excel sobra para esto.",
      },
      {
        type: "ul",
        items: [
          "Pegas fecha, qué hiciste y las horas.",
          "Ves el total.",
          "Guardas el PDF y lo adjuntas tú. La web no tiene tu correo.",
        ],
      },
      {
        type: "cta",
        href: "/horas",
        label: "Parte de horas",
        text: "Los datos se quedan en este navegador. Si cambias de móvil, la lista no viaja.",
      },
    ],
  },
  {
    slug: "relacion-de-gastos-iva-para-el-gestor",
    title: "Relación de gastos con base e IVA para mandar al gestor",
    meta: "Pegas fecha, tienda e importe. Sale base, IVA y total. PDF para el gestor. Sin Excel ni servidor.",
    kicker: "Gastos",
    date: "2026-09-30",
    keywords: [
      "relacion de gastos",
      "gastos autonomo iva",
      "tickets gestor",
      "lista gastos iva",
    ],
    toolHref: "/gastos",
    blocks: [
      {
        type: "p",
        text: "El gestor pide “los tickets del mes”. Están en el cajón y en el WhatsApp. Relación de gastos: pegas fecha, tienda, lo que pagaste y el tipo de IVA. Sale la base.",
      },
      {
        type: "p",
        text: "No es Verifactu ni la contabilidad. Es el Excel de siempre, en un PDF presentable. Los importes van a la española (1.200,50).",
      },
      {
        type: "cta",
        href: "/gastos",
        label: "Relación de gastos",
        text: "Nadie más ve la lista. Vive en este navegador.",
      },
    ],
  },
  {
    slug: "versiones-basico-recomendado-urgente",
    title: "Mandar básico, recomendado y urgente sin tres Word distintos",
    meta: "Un cliente, un encargo, varias ofertas en PDF. El cliente elige en el papel. Para autónomos.",
    kicker: "Versiones",
    date: "2026-09-30",
    keywords: [
      "presupuesto basico y premium",
      "varias versiones presupuesto",
      "oferta recomendada autonomo",
    ],
    toolHref: "/versiones",
    blocks: [
      {
        type: "p",
        text: "El cliente pregunta “¿y si lo hacemos más simple?” y “¿y si es para ya?”. Tres Word es un lío de nombres. Versiones: un encargo, varios paquetes, un PDF que se entiende.",
      },
      {
        type: "p",
        text: "Si el mismo pack va a diez personas, usa la tanda de presupuestos. Esto es para uno, con variantes.",
      },
      {
        type: "cta",
        href: "/versiones",
        label: "Versiones de un trabajo",
        text: "Logo, IVA y el papel en este navegador. Tú lo envías.",
      },
    ],
  },
  {
    slug: "audio-a-wav-para-la-gestoria",
    title: "Pasar un MP3 o una nota de voz a WAV para la gestoría",
    meta: "Convierte MP3, M4A, OGG o WebM a WAV en el navegador. Sin subir el audio. MP3 de salida no está.",
    kicker: "Audio a WAV",
    date: "2026-09-30",
    keywords: ["mp3 a wav", "nota de voz a wav", "convertir audio a wav"],
    toolHref: "/audio-a-wav",
    blocks: [
      {
        type: "p",
        text: "Hay programas de despacho que solo tragan WAV. Tú tienes un MP3 o la nota de voz del iPhone (M4A). Audio a WAV lo decodifica aquí. Codificar a MP3 pide un motor que no montamos: no lo fingimos.",
      },
      {
        type: "cta",
        href: "/audio-a-wav",
        label: "Audio a WAV",
        text: "Elige el archivo y descarga. Si solo quieres un trozo, recorta después.",
      },
    ],
  },
  {
    slug: "recortar-nota-de-voz",
    title: "Recortar una nota de voz y quedarte con los veinte segundos que valen",
    meta: "Marcas inicio y fin de un MP3 o M4A y descargas un WAV. En el navegador, sin subir el audio.",
    kicker: "Recortar audio",
    date: "2026-09-30",
    keywords: ["recortar audio", "cortar nota de voz", "recortar mp3"],
    toolHref: "/recortar-audio",
    blocks: [
      {
        type: "p",
        text: "La nota dura tres minutos. Lo que importa son veinte segundos. Recortar audio: marcas inicio y fin, sales con un WAV. Extraer el audio de un vídeo MP4 no está.",
      },
      {
        type: "cta",
        href: "/recortar-audio",
        label: "Recortar audio",
        text: "El archivo no sale de este aparato. En el teléfono, comparte al guardar.",
      },
    ],
  },
  {
    slug: "herramientas-del-dia-a-dia-del-autonomo",
    title: "Qué herramientas usa un autónomo de verdad un martes cualquiera",
    meta: "Unir PDF, comprimir la foto de la sede, un recordatorio de cobro y un presupuesto. Sin CRM y sin subir archivos.",
    kicker: "Día a día",
    date: "2026-09-30",
    keywords: [
      "herramientas autonomos",
      "unir pdf autonomo",
      "oficina sin crm",
      "administracion autonomo",
    ],
    toolHref: "/herramientas-pdf",
    blocks: [
      {
        type: "p",
        text: "El martes no pides un ERP. Pides: juntar el DNI con el contrato, que la foto entre en la sede, diez presupuestos iguales y un WhatsApp de cobro que no dé vergüenza. Eso es Luna Oficio.",
      },
      {
        type: "h2",
        text: "El orden que suele funcionar",
      },
      {
        type: "ul",
        items: [
          "Fotos: recortar → redimensionar → comprimir o HEIC a JPG.",
          "Papeles: unir PDF o JPG a PDF. Si pesa, comprimir.",
          "Oficio: presupuestos o cobros. El PDF y el mensaje los mandas tú.",
        ],
      },
      {
        type: "p",
        text: "Los datos se quedan en el navegador. No hay copia nuestra. Cambia de teléfono y la cuenta hay que crearla otra vez: es el precio de no tener tus contratos en un servidor ajeno.",
      },
      {
        type: "cta",
        href: "/unir-pdf",
        label: "Empezar por unir PDF",
        text: "Es la búsqueda más repetida. Luego el blog y el resto de herramientas.",
      },
    ],
  },
  {
    slug: "girar-foto-del-movil-que-sale-de-lado",
    title: "Girar la foto del móvil que se ha guardado de lado",
    meta: "Gira JPG o PNG 90, 180 o 270 grados en el navegador. Varias a la vez. Sin subir la foto.",
    kicker: "Girar imagen",
    date: "2026-09-30",
    keywords: ["girar imagen", "rotar foto", "foto de lado movil"],
    toolHref: "/girar-imagen",
    blocks: [
      {
        type: "p",
        text: "El ticket salió vertical y el archivo está apaisado. Girar imagen: 90, 180 o 270. Varias a la vez. Si es un PDF entero, usa Rotar PDF.",
      },
      {
        type: "cta",
        href: "/girar-imagen",
        label: "Girar imagen",
        text: "Elige las fotos y descarga. El archivo no sale de este navegador.",
      },
    ],
  },
];
