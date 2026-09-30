export const imageKit = [
  {
    href: "/comprimir-imagen",
    slug: "compress" as const,
    name: "Comprimir imagen",
    problem: "La foto pesa 6 MB y el formulario no la traga.",
    does: "Bajas el peso en este navegador. JPG y WebP bajan de verdad.",
  },
  {
    href: "/png-a-jpg",
    slug: "to-jpg" as const,
    name: "PNG a JPG",
    problem: "Me piden JPG y yo tengo un PNG o un WebP.",
    does: "Lo pasas a JPG. El fondo transparente se llena de blanco.",
  },
  {
    href: "/jpg-a-png",
    slug: "to-png" as const,
    name: "JPG a PNG",
    problem: "Necesito PNG para un diseño o un sello.",
    does: "JPG, WebP o HEIC a PNG, aquí mismo.",
  },
  {
    href: "/jpg-a-webp",
    slug: "to-webp" as const,
    name: "JPG a WebP",
    problem: "La web quiere WebP para que pese menos.",
    does: "JPG, PNG o HEIC a WebP, sin subir el archivo.",
  },
  {
    href: "/heic-a-jpg",
    slug: "heic" as const,
    name: "HEIC a JPG",
    problem: "La foto del iPhone no se abre en el Windows del gestor.",
    does: "HEIC/HEIF a JPG. El archivo no sale de este aparato.",
  },
  {
    href: "/redimensionar-imagen",
    slug: "resize" as const,
    name: "Redimensionar imagen",
    problem: "El avatar pide 400 px y la foto es enorme.",
    does: "Fijas el ancho o el alto. Se mantiene la proporción.",
  },
  {
    href: "/recortar-imagen",
    slug: "crop" as const,
    name: "Recortar imagen",
    problem: "Sobran bordes o hay que dejar solo el DNI.",
    does: "Marcas el recuadro sobre la foto y te la bajas.",
  },
  {
    href: "/girar-imagen",
    slug: "rotate" as const,
    name: "Girar imagen",
    problem: "El móvil la ha guardado de lado.",
    does: "Giro de 90° y descarga. Varias a la vez si quieres.",
  },
] as const;

export type ImageKitSlug = (typeof imageKit)[number]["slug"];

export const imageProKit = [
  {
    href: "/webp-en-lote",
    slug: "webp-batch" as const,
    name: "WebP en lote",
    problem: "Hay que pasar toda la carpeta de imágenes de la web a WebP.",
    does: "Cientos de JPG y PNG a WebP de una vez, con ancho máximo y zip. Pro.",
    pro: true,
  },
  {
    href: "/plugin-wordpress-webp",
    slug: "wp-plugin" as const,
    name: "Plugin WordPress WebP",
    problem: "La biblioteca de medios de WordPress pesa y PageSpeed se queja.",
    does: "Plugin que convierte a WebP lo que subes y toda la biblioteca. Pro.",
    pro: true,
  },
] as const;

export const audioKit = [
  {
    href: "/audio-a-wav",
    slug: "to-wav" as const,
    name: "Audio a WAV",
    problem: "El programa de la gestoría solo traga WAV.",
    does: "MP3, M4A, OGG o WebM a WAV, en este navegador.",
  },
  {
    href: "/recortar-audio",
    slug: "trim" as const,
    name: "Recortar audio",
    problem: "La nota de voz dura tres minutos y solo valen veinte segundos.",
    does: "Marcas inicio y fin y te bajas un WAV.",
  },
] as const;

export type AudioKitSlug = (typeof audioKit)[number]["slug"];
