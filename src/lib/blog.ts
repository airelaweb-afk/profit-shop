import { extraPosts } from "@/lib/blog-extra";
import type { BlogPost } from "@/lib/blog-types";
import { SITE_URL } from "@/lib/site";

export type { BlogBlock, BlogPost } from "@/lib/blog-types";

const corePosts: BlogPost[] = [
  {
    slug: "unir-varios-pdf-en-uno",
    title: "Cómo unir varios PDF en uno solo sin subirlos a internet",
    meta: "Une PDF en el navegador: DNI, presupuesto y contrato en un archivo. Sin iLovePDF ni servidor. Guía para autónomos.",
    kicker: "Unir PDF",
    date: "2026-09-30",
    keywords: [
      "unir pdf",
      "juntar pdf",
      "combinar pdf online",
      "unir pdf sin subir",
    ],
    toolHref: "/unir-pdf",
    blocks: [
      {
        type: "p",
        text: "La búsqueda más repetida de este oficio es “unir PDF”. El cliente pide un solo archivo. Tú tienes el presupuesto, el DNI y las condiciones en tres PDFs. Las webs que salen primero te piden que subas el documento. Aquí no: se junta en este aparato y te lo descargas.",
      },
      {
        type: "h2",
        text: "Por qué no conviene subirlo",
      },
      {
        type: "p",
        text: "Un PDF de autónomo casi siempre lleva NIF, domicilio o importes. Si lo subes a un conversor “gratis”, el archivo viaja a un servidor que no controlas. Para un ticket da igual. Para un contrato, no. Unir PDF en el navegador evita ese viaje.",
      },
      {
        type: "h2",
        text: "Cómo se hace en Luna Oficio",
      },
      {
        type: "ul",
        items: [
          "Entra con la cuenta de este navegador (vive aquí; no hay recuperación en otro móvil).",
          "Abre Unir PDF y elige los archivos en el orden en que quieres que salgan.",
          "Si te has equivocado de orden, súbelos o bájalo con las flechas.",
          "Pulsa Unir y guardar. En el teléfono se abre compartir: Guardar en Archivos.",
        ],
      },
      {
        type: "cta",
        href: "/unir-pdf",
        label: "Unir PDF ahora",
        text: "La herramienta está lista. No convierte a Word: eso, sin servidor, queda mal y no lo fingimos.",
      },
      {
        type: "h2",
        text: "Errores típicos",
      },
      {
        type: "p",
        text: "Un PDF con contraseña no se deja abrir. Un archivo de más de 20 MB en el móvil tarda; no es que se haya colgado. Si el cliente quiere Word, diles que el PDF unido es el original: el .docx de un conversor online remaqueta mal las tablas.",
      },
    ],
  },
  {
    slug: "comprimir-pdf-para-enviar-por-correo",
    title: "Comprimir un PDF para que entre en el correo (sin Adobe)",
    meta: "Reduce el peso de un PDF en el navegador para Gmail y adjuntos. Compresión ligera o fuerte. El archivo no se sube.",
    kicker: "Comprimir PDF",
    date: "2026-09-30",
    keywords: ["comprimir pdf", "aligerar pdf", "pdf demasiado pesado correo"],
    toolHref: "/comprimir-pdf",
    blocks: [
      {
        type: "p",
        text: "“Comprimir PDF” es la otra búsqueda gorda. El escaneo del gestor pesa 18 MB y Gmail lo corta. Adobe cobra. Las webs gratis se quedan el archivo. Aquí se reescribe en el navegador.",
      },
      {
        type: "h2",
        text: "Ligera o fuerte",
      },
      {
        type: "ul",
        items: [
          "Ligera: limpia el PDF y mantiene el texto seleccionable. Para un presupuesto o una factura suele bastar.",
          "Fuerte: pasa cada página a foto. Baja más. El texto ya no se copia. Útil para un escaneo hinchado.",
        ],
      },
      {
        type: "p",
        text: "No es Ghostscript de Adobe. Si el PDF ya está bien comprimido, el peso casi no baja: no hay magia. Prueba primero la ligera; si el correo sigue rechazándolo, la fuerte.",
      },
      {
        type: "cta",
        href: "/comprimir-pdf",
        label: "Comprimir PDF",
        text: "Elige el archivo, elige la fuerza, descárgalo. Nada viaja a un servidor nuestro.",
      },
    ],
  },
  {
    slug: "heic-a-jpg-fotos-iphone-windows",
    title: "Pasar HEIC del iPhone a JPG para Windows y el gestor",
    meta: "Convierte fotos HEIC o HEIF a JPG en el navegador. Windows y muchos correos no abren HEIC. Sin subir la foto.",
    kicker: "HEIC a JPG",
    date: "2026-09-30",
    keywords: ["heic a jpg", "heic to jpg", "fotos iphone windows"],
    toolHref: "/heic-a-jpg",
    blocks: [
      {
        type: "p",
        text: "El iPhone guarda en HEIC. El Windows del gestor o del cliente no lo abre. Te piden JPG. “HEIC a JPG” se busca todos los días. La primera vez tarda un poco: carga el decodificador en este aparato, no en la nube.",
      },
      {
        type: "h2",
        text: "Si el iPhone ya te da JPG",
      },
      {
        type: "p",
        text: "Al compartir, a veces iOS convierte solo. Entonces no hace falta esta página. Si el archivo se llama .heic o el correo lo rechaza, úsala. Elige las fotos del carrete y descarga JPG.",
      },
      {
        type: "cta",
        href: "/heic-a-jpg",
        label: "HEIC a JPG",
        text: "Varias a la vez. En el teléfono: Elegir fotos. El archivo no sale de aquí.",
      },
    ],
  },
  {
    slug: "comprimir-imagen-para-formulario",
    title: "La foto pesa 6 MB y el formulario no la traga",
    meta: "Comprime JPG, PNG o WebP en el navegador para sedes electrónicas y formularios. Sin subir la imagen a un servidor.",
    kicker: "Comprimir imagen",
    date: "2026-09-30",
    keywords: [
      "comprimir imagen",
      "reducir peso foto",
      "jpg demasiado pesado",
    ],
    toolHref: "/comprimir-imagen",
    blocks: [
      {
        type: "p",
        text: "Sede electrónica, seguro, banco: “máximo 1 MB”. La foto del DNI sale a 6. Comprimir imagen es de las búsquedas que más convierten, porque el atasco es hoy.",
      },
      {
        type: "h2",
        text: "JPG sí, PNG a veces no",
      },
      {
        type: "p",
        text: "Un JPG o un WebP bajan de verdad si recortas calidad. Un PNG a veces no adelgaza hasta pasarlo a JPG (pierdes transparencia, ganas peso razonable). Si el formulario pide JPG, usa PNG a JPG y luego comprime.",
      },
      {
        type: "cta",
        href: "/comprimir-imagen",
        label: "Comprimir imagen",
        text: "Calidad al 70 % suele entrar. Si no, baja un poco más o redimensiona a 1600 px de ancho.",
      },
    ],
  },
  {
    slug: "firmar-pdf-sin-adobe-ni-clave",
    title: "Firmar un PDF en el móvil sin Adobe y sin Cl@ve",
    meta: "Rellena casillas, escribe y firma un PDF en el navegador. No es certificado digital. El archivo no se sube.",
    kicker: "Firmar PDF",
    date: "2026-09-30",
    keywords: ["firmar pdf", "rellenar pdf online", "firmar pdf movil"],
    toolHref: "/pdf",
    blocks: [
      {
        type: "p",
        text: "Te mandan un modelo 145, una autorización o un parte. No tienes Adobe. Cl@ve no pinta aquí: esto es tu rúbrica, como en papel, no un certificado de la FNMT.",
      },
      {
        type: "h2",
        text: "Cómo no liar el trámite",
      },
      {
        type: "ul",
        items: [
          "Amplía con + hasta ver el recuadro. En el teléfono los checks van en grande (M o L).",
          "Dibuja la firma en el recuadro y luego pulsa donde debe ir.",
          "Descarga y abre el PDF antes de enviarlo. Si falta una cruz, deshaz y vuelve.",
        ],
      },
      {
        type: "p",
        text: "Un PDF con campos AcroForm se rellena en la lista de la izquierda. Un PDF “plano” (escaneado) se marca encima. No es lo mismo que firmar ante notario.",
      },
      {
        type: "cta",
        href: "/pdf",
        label: "Firmar PDF",
        text: "Elige el PDF del teléfono o del ordenador. Se queda en este navegador.",
      },
    ],
  },
  {
    slug: "png-a-jpg-sin-subir-el-archivo",
    title: "Pasar PNG a JPG cuando te piden foto y tú tienes un recorte",
    meta: "Convierte PNG, WebP o HEIC a JPG en el navegador. El fondo transparente se rellena de blanco.",
    kicker: "PNG a JPG",
    date: "2026-09-30",
    keywords: ["png a jpg", "convertir png a jpg", "png a jpeg"],
    toolHref: "/png-a-jpg",
    blocks: [
      {
        type: "p",
        text: "El logo es PNG. El formulario dice JPG. El recorte de WhatsApp a veces llega en WebP. PNG a JPG es una búsqueda corta y constante.",
      },
      {
        type: "p",
        text: "El transparente se llena de blanco. Si necesitabas el hueco vacío, no uses esta conversión: el JPG no lleva alfa. Para un sello sobre fondo, quédate en PNG.",
      },
      {
        type: "cta",
        href: "/png-a-jpg",
        label: "PNG a JPG",
        text: "Elige las fotos, convierte, descarga. Si pesan, comprime después.",
      },
    ],
  },
  {
    slug: "jpg-a-pdf-dni-y-tickets",
    title: "Fotos del DNI o de los tickets, a un PDF A4",
    meta: "Pasa JPG o PNG a PDF A4 en el navegador. Ideal para DNI, tickets y capturas que hay que mandar juntas.",
    kicker: "JPG a PDF",
    date: "2026-09-30",
    keywords: ["jpg a pdf", "imagen a pdf", "fotos a pdf"],
    toolHref: "/jpg-a-pdf",
    blocks: [
      {
        type: "p",
        text: "Te piden “el DNI en PDF”. Tienes dos fotos. JPG a PDF pone cada imagen en una hoja A4, en el orden que elijas. En el teléfono puedes hacer la foto en el momento.",
      },
      {
        type: "p",
        text: "No OCR: no convierte la foto en texto editable. Es el PDF de las fotos, que es lo que pide el 90 % de los trámites.",
      },
      {
        type: "cta",
        href: "/jpg-a-pdf",
        label: "JPG a PDF",
        text: "Ordena las fotos con las flechas y crea el PDF. No sale de este navegador.",
      },
    ],
  },
  {
    slug: "presupuestos-en-lote-para-autonomos",
    title: "Hacer diez presupuestos iguales sin un CRM",
    meta: "Tanda de presupuestos en PDF para autónomos: pegas la lista, sales con un papel por cliente y mensaje listo.",
    kicker: "Presupuestos",
    date: "2026-09-30",
    keywords: [
      "hacer presupuestos",
      "varios presupuestos a la vez",
      "plantilla presupuesto autonomo",
    ],
    toolHref: "/presupuestos",
    blocks: [
      {
        type: "p",
        text: "El CRM te pide agenda, clientes y hábitos. Tú el martes necesitas diez PDFs con el mismo trabajo y distinto nombre. Eso es una página, no un software de gestión.",
      },
      {
        type: "ul",
        items: [
          "Pegas tu logo, IVA y numeración.",
          "Pegas la lista de clientes.",
          "Sales con un PDF por fila y un texto para WhatsApp o correo.",
        ],
      },
      {
        type: "cta",
        href: "/presupuestos",
        label: "Tanda de presupuestos",
        text: "Los datos se quedan en este navegador. Si cambias de teléfono, la cuenta hay que crearla otra vez.",
      },
    ],
  },
  {
    slug: "recordatorio-de-cobro-por-whatsapp",
    title: "Recordatorio de cobro por WhatsApp sin pelearte",
    meta: "Mensajes de impago listos: primera, segunda o última ronda. Abres WhatsApp o correo con el texto ya escrito.",
    kicker: "Cobros",
    date: "2026-09-30",
    keywords: [
      "recordatorio de cobro",
      "mensaje impago whatsapp",
      "cobrar a un cliente",
    ],
    toolHref: "/cobros",
    blocks: [
      {
        type: "p",
        text: "Te deben. No quieres el tono del abogado ni el del mem. Pegas quién, cuánto y desde cuándo. Sales con un mensaje amable, uno más serio o el último aviso. wa.me abre WhatsApp con el texto.",
      },
      {
        type: "p",
        text: "No es un fichero de morosos ni Verifactu. Es el texto del martes. Los importes van a la española (1.200 €).",
      },
      {
        type: "cta",
        href: "/cobros",
        label: "Recordatorios de cobro",
        text: "La lista vive en este navegador. Nadie más la ve.",
      },
    ],
  },
  {
    slug: "por-que-no-convertimos-pdf-a-word",
    title: "Por qué no convertimos PDF a Word (y qué hacer mientras)",
    meta: "PDF a Word es lo más buscado después de unir. En el navegador queda mal. Explicamos el atajo honesto.",
    kicker: "PDF a Word",
    date: "2026-09-30",
    keywords: ["pdf a word", "convertir pdf a word", "pdf to docx"],
    toolHref: "/herramientas-pdf",
    blocks: [
      {
        type: "p",
        text: "Algunos conversores online sí pasan a Word: suben el archivo a un servidor con un motor de maquetación. En el navegador, sin eso, sale un .docx con el texto desordenado. No vamos a cobrarte un Word feo.",
      },
      {
        type: "p",
        text: "Mientras tanto: si el cliente quiere editar, pide el original. Si solo hay que mandar o firmar, une, comprime o firma el PDF. PDF a Word queda aparcado hasta que haya motor de verdad y se avise que el archivo viaja.",
      },
      {
        type: "cta",
        href: "/unir-pdf",
        label: "Unir PDF (sí se puede)",
        text: "Lo que sí hacemos bien, en este aparato, sin subir nada.",
      },
    ],
  },
];

export const posts: BlogPost[] = [...corePosts, ...extraPosts];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function postUrl(slug: string) {
  return `${SITE_URL}/blog/${slug}/`;
}

export function postsForTool(href: string) {
  return posts.filter((post) => post.toolHref === href);
}
