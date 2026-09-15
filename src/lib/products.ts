export type Category =
  | "planificacion"
  | "redes"
  | "negocio"
  | "carrera"
  | "combos";

export type CoverStyle =
  | "planner"
  | "instagram"
  | "invoice"
  | "cv"
  | "calendar"
  | "brand"
  | "bundle"
  | "pricelist";

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  category: Category;
  featured: boolean;
  bestseller?: boolean;
  pages: string;
  format: string;
  includes: string[];
  details: string[];
  cover: CoverStyle;
  reviews: { name: string; city: string; quote: string; rating: number }[];
};

export const CATEGORIES: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "planificacion", label: "Planificación" },
  { id: "redes", label: "Redes sociales" },
  { id: "negocio", label: "Negocio" },
  { id: "carrera", label: "Carrera" },
  { id: "combos", label: "Combos" },
];

export const products: Product[] = [
  {
    slug: "planner-mensual-luna",
    name: "Planner mensual Luna",
    shortName: "Planner Luna",
    tagline: "Doce meses en papel, sin aplicaciones que te distraigan.",
    description:
      "Un planner imprimible para organizar el mes, la semana y los hábitos. Pensado para quien vende, estudia o dirige un proyecto pequeño y necesita ver el tiempo en una sola hoja.",
    price: 1200,
    category: "planificacion",
    featured: true,
    bestseller: true,
    pages: "28 páginas",
    format: "PDF A4 y US Letter",
    includes: [
      "Portada y guía de uso",
      "Calendario anual 2026",
      "12 vistas mensuales",
      "Planificador semanal",
      "Tracker de hábitos y dinero",
    ],
    details: [
      "Imprime las hojas que uses, no el archivo entero.",
      "Márgenes listos para encuadernar o meter en una carpeta.",
      "Espacio para ingresos, gastos y una meta del mes.",
    ],
    cover: "planner",
    reviews: [
      {
        name: "Mariana Solís",
        city: "Guadalajara",
        quote:
          "Lo imprimí en una papelería de barrio y por fin dejé de saltar entre tres apps. El tracker de dinero es lo que más uso.",
        rating: 5,
      },
      {
        name: "Iván Herrera",
        city: "Madrid",
        quote:
          "Simple, bonito y sin relleno. En una tarde tenía el trimestre a la vista.",
        rating: 5,
      },
    ],
  },
  {
    slug: "pack-instagram-30",
    name: "Pack 30 posts para Instagram",
    shortName: "Pack Instagram",
    tagline: "Un mes de contenido listo para adaptar a tu marca.",
    description:
      "Treinta piezas editables para feed: anuncios, testimonios, listas, preguntas y ofertas. El copy está en español y se cambia en Canva en minutos.",
    price: 1900,
    category: "redes",
    featured: true,
    pages: "30 plantillas",
    format: "Canva (enlace de duplicado)",
    includes: [
      "10 posts de autoridad",
      "10 posts de oferta y prueba social",
      "10 posts de comunidad y preguntas",
      "Paleta y tipografías sugeridas",
      "Guía de 4 páginas para publicar sin atascarte",
    ],
    details: [
      "No necesitas Canva Pro para editar el pack base.",
      "Tamaños 1080×1350, listos para feed vertical.",
      "Textos pensados para servicios, no para moda genérica.",
    ],
    cover: "instagram",
    reviews: [
      {
        name: "Laura Méndez",
        city: "Bogotá",
        quote:
          "En dos tardes armé el mes. Vendí tres sesiones de marca personal con los posts de oferta.",
        rating: 5,
      },
    ],
  },
  {
    slug: "kit-facturas",
    name: "Kit de facturas y presupuestos",
    shortName: "Kit facturas",
    tagline: "Cobra como un estudio, aunque trabajes desde la cocina.",
    description:
      "Plantillas para presupuestos, facturas, recibos y seguimiento de pagos. Listas para Google Docs y para imprimir en PDF. Incluyen campos de impuestos y condiciones de servicio en español.",
    price: 1500,
    category: "negocio",
    featured: true,
    bestseller: true,
    pages: "8 documentos",
    format: "Google Docs + PDF",
    includes: [
      "Presupuesto con desglose de horas",
      "Factura y nota de crédito",
      "Recibo de anticipo",
      "Tabla de pagos pendientes",
      "Cláusulas cortas de entrega y revisión",
    ],
    details: [
      "Cambia logo, color y datos fiscales una sola vez.",
      "Sirve para freelancers, talleres y tiendas pequeñas.",
      "No sustituye un sistema contable: es para cobrar más claro.",
    ],
    cover: "invoice",
    reviews: [
      {
        name: "Diego Paredes",
        city: "Lima",
        quote:
          "Mis clientes dejaron de preguntar ‘¿esto incluye IVA?’. El presupuesto se ve serio.",
        rating: 5,
      },
    ],
  },
  {
    slug: "plantillas-cv",
    name: "Tres plantillas de CV",
    shortName: "Plantillas CV",
    tagline: "Un currículum que se lee en veinte segundos.",
    description:
      "Tres diseños de una página: estudio, producto y dirección. Espacios para logros medibles, no para párrafos de relleno. Incluyen carta de presentación corta.",
    price: 900,
    category: "carrera",
    featured: false,
    pages: "6 páginas",
    format: "Google Docs + PDF",
    includes: [
      "CV clásico (una columna)",
      "CV de producto / diseño",
      "CV de liderazgo",
      "Carta de presentación de media página",
      "Lista de verbos de logro en español",
    ],
    details: [
      "Pensados para lectura en pantalla y para imprimir en laser.",
      "Sin columnas frágiles que se rompen al pegar en LinkedIn.",
    ],
    cover: "cv",
    reviews: [
      {
        name: "Camila Ruiz",
        city: "Santiago",
        quote:
          "Reescribí mi CV en una noche. A la semana tenía dos entrevistas.",
        rating: 5,
      },
    ],
  },
  {
    slug: "calendario-editorial-2026",
    name: "Calendario editorial 2026",
    shortName: "Calendario 2026",
    tagline: "Fechas, campañas y huecos vacíos, en un solo tablero.",
    description:
      "Un calendario anual para quien publica contenido o lanza productos. Incluye festivos de México, España, Colombia, Argentina y Estados Unidos, más una columna para ofertas propias.",
    price: 1400,
    category: "redes",
    featured: false,
    pages: "16 páginas",
    format: "PDF + Google Sheets",
    includes: [
      "Vista anual y 12 meses",
      "Festivos de 5 países",
      "Ideas de campaña por trimestre",
      "Hoja de seguimiento de piezas publicadas",
    ],
    details: [
      "La hoja de cálculo se filtra por país.",
      "Úsala junto al Pack Instagram o con tu propio diseño.",
    ],
    cover: "calendar",
    reviews: [
      {
        name: "Noelia Castro",
        city: "Buenos Aires",
        quote:
          "Por fin dejé de enterarme de Black Friday el mismo día. Lo tengo en la pared.",
        rating: 4,
      },
    ],
  },
  {
    slug: "brand-kit-freelance",
    name: "Brand kit para freelancers",
    shortName: "Brand kit",
    tagline: "Una identidad pequeña, coherente y lista para cobrar más.",
    description:
      "Sistema de marca reducido: paleta, tipografías, logo wordmark, avatares, firma de correo y portadas. Pensado para consultores, fotógrafos y estudios de una persona.",
    price: 2400,
    category: "negocio",
    featured: true,
    pages: "22 páginas + archivos",
    format: "PDF + PNG + Canva",
    includes: [
      "Guía de marca de 12 páginas",
      "4 variaciones de wordmark",
      "Paleta y reglas de uso",
      "Plantilla de propuesta comercial",
      "Firma de correo y avatar",
    ],
    details: [
      "No es un logo a medida: es un sistema que adaptas con tu nombre.",
      "Ideal si hoy usas Canva al azar y se nota.",
    ],
    cover: "brand",
    reviews: [
      {
        name: "Andrés Molina",
        city: "Monterrey",
        quote:
          "Subí mis precios un 20% la semana siguiente. El PDF de propuesta se ve de estudio.",
        rating: 5,
      },
    ],
  },
  {
    slug: "bundle-emprendedor",
    name: "Bundle Emprendedor",
    shortName: "Bundle",
    tagline: "Marca, cobro y contenido: lo que falta para abrir la tienda.",
    description:
      "El atajo si estás armando un negocio de servicios. Incluye el Brand kit, el Kit de facturas y el Pack de 30 posts, con un descuento frente a comprarlos sueltos.",
    price: 3900,
    compareAt: 5800,
    category: "combos",
    featured: true,
    bestseller: true,
    pages: "3 productos",
    format: "Canva + Docs + PDF",
    includes: [
      "Brand kit para freelancers",
      "Kit de facturas y presupuestos",
      "Pack 30 posts para Instagram",
      "Checklist de lanzamiento de 1 página",
    ],
    details: [
      "Ahorras 19 USD frente al precio suelto.",
      "Descargas los tres archivos en la misma pantalla de pedido.",
    ],
    cover: "bundle",
    reviews: [
      {
        name: "Elena Vargas",
        city: "Valencia",
        quote:
          "En un fin de semana tenía marca, factura y un mes de posts. Eso me desbloqueó.",
        rating: 5,
      },
    ],
  },
  {
    slug: "lista-de-precios",
    name: "Lista de precios para servicios",
    shortName: "Lista de precios",
    tagline: "Deja de cotizar desde cero en cada mensaje de WhatsApp.",
    description:
      "Una hoja de precios clara para paquetes, horas y extras. Incluye ejemplos para diseño, tutorías, fotografía y consultoría, más una versión en blanco.",
    price: 800,
    category: "negocio",
    featured: false,
    pages: "5 páginas",
    format: "PDF + Google Docs",
    includes: [
      "Lista de paquetes (bueno / mejor / completo)",
      "Lista por hora con mínimo",
      "Extras y recargos",
      "Texto corto para pegar en Instagram o WhatsApp",
    ],
    details: [
      "Los ejemplos son editables: borra el oficio que no sea el tuyo.",
      "Combina bien con el Kit de facturas.",
    ],
    cover: "pricelist",
    reviews: [
      {
        name: "Pablo Ríos",
        city: "Quito",
        quote:
          "Pasé de negociar cada trabajo a enviar un PDF. Cierro más rápido.",
        rating: 5,
      },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getRelatedProducts(slug: string, limit = 3) {
  const current = getProduct(slug);
  if (!current) return products.slice(0, limit);
  return products
    .filter((product) => product.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 1 : 0;
      const bMatch = b.category === current.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}

export function getCategoryLabel(id: Category) {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
