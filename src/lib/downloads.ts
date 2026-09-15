import { getProduct } from "./products";

function fileFor(slug: string, title: string, body: string) {
  return {
    filename: `${slug}.txt`,
    mime: "text/plain;charset=utf-8",
    content: `LUNA ATELIER — ${title}\n${"=".repeat(40)}\n\n${body.trim()}\n`,
  };
}

const FILES: Record<string, { filename: string; mime: string; content: string }> =
  {
    "planner-mensual-luna": fileFor(
      "planner-mensual-luna",
      "Planner mensual Luna",
      `
CÓMO USARLO
1. Imprime la portada y el mes en curso (A4 o Letter).
2. Elige 3 hábitos y 1 meta de dinero para las próximas 4 semanas.
3. Cada domingo, copia las 3 tareas que sí o sí deben ocurrir.

MES: _______________    META: ____________________________

SEMANA 1
Lun _____  Mar _____  Mié _____  Jue _____  Vie _____  Sáb _____  Dom _____
Prioridad 1: ____________________
Prioridad 2: ____________________
Dinero: ingresos ______  gastos ______  neto ______

HÁBITOS (marca 7 días)
[ ] Dormir 7 h   [ ] Vender / prospectar   [ ] Mover el cuerpo   [ ] Cerrar el día

NOTA
Esta es la versión de demostración incluida en la tienda.
La versión completa añade las 12 vistas mensuales y el calendario 2026.
`,
    ),
    "pack-instagram-30": fileFor(
      "pack-instagram-30",
      "Pack 30 posts — guía de copy",
      `
ESTRUCTURA DE UN POST DE OFERTA (repite 4 veces al mes)
Línea 1: el resultado, no el servicio.
Línea 2: para quién es (y para quién no).
Línea 3: qué incluye, en 3 viñetas.
Línea 4: precio o “escríbeme la palabra LISTA”.
Línea 5: una prueba (número, plazo o cliente).

10 GANCHOS EN ESPAÑOL
1. Si te piden “el logo para ayer”, cobra recargo.
2. Un mes de contenido no se improvisa el domingo.
3. Tu precio bajo no te hace más amable: te hace invisible.
4. Tres paquetes. Un sí claro.
5. Lo que no está en el presupuesto, no está en el trabajo.
6. Publicar todos los días no vende. Publicar con oferta, sí.
7. Tu cliente no quiere un PDF. Quiere dejar de improvisar.
8. Cierra la semana con una historia de un trabajo entregado.
9. Si no tienes testimonios, pide uno hoy. Un audio basta.
10. El feed es un catálogo. Trátalo como tal.

En Canva: duplica el archivo y cambia nombre, color y precio.
`,
    ),
    "kit-facturas": fileFor(
      "kit-facturas",
      "Kit de facturas — texto base",
      `
DATOS DEL EMISOR
Nombre / razón social: ____________________
Correo: ____________________   WhatsApp: ____________________
Clave fiscal / NIF / RFC: ____________________

PRESUPUESTO Nº ______
Cliente: ____________________    Fecha: __________    Válido 14 días

Concepto                         Cant.    Precio      Total
-------------------------------- ------ ---------- ----------
                                     
Condiciones: 50% al aceptar. El resto contra entrega.
Revisiones incluidas: 2. Extra: 40 USD / ronda.
Plazo estimado: ____ días hábiles desde el anticipo.

FACTURA Nº ______
Referencia del presupuesto: ______
Pagado: [ ] anticipo  [ ] total     Método: _____________

Este archivo es la versión de demostración. Duplica el Doc
y pega tu logo en la cabecera.
`,
    ),
    "plantillas-cv": fileFor(
      "plantillas-cv",
      "CV — esqueleto de una página",
      `
NOMBRE APELLIDO
Rol al que aplicas  ·  Ciudad  ·  correo  ·  LinkedIn

PERFIL (3 líneas, no 8)
Hago X para Y. En los últimos N años logré A, B y C.
Busco un equipo donde ______________.

EXPERIENCIA
Empresa — Rol (fechas)
• Logro con número: ____________________
• Logro con número: ____________________
• Contexto de equipo o stack: ____________________

PROYECTOS (si eres junior o freelance)
Nombre — resultado medible — enlace

EDUCACIÓN / IDIOMAS / HERRAMIENTAS
Una línea cada uno. Sin relleno.

CARTA (media página)
Párrafo 1: por qué esta empresa, con un detalle real.
Párrafo 2: una historia de 4 líneas con un resultado.
Párrafo 3: disponibilidad y llamada a una conversación.
`,
    ),
    "calendario-editorial-2026": fileFor(
      "calendario-editorial-2026",
      "Calendario editorial 2026 — recorte",
      `
TRIMESTRE 1 — ideas de campaña
Enero: reinicio, precios nuevos, “lo que no haré este año”.
Febrero: San Valentín B2B (regala una auditoría corta).
Marzo: cierre de trimestre y casos de estudio.

FESTIVOS ÚTILES (verifica el año en tu país)
MX: 5 may, 16 sep, 2 nov, 12 dic
ES: 6 ene, semana santa, 15 ago, 12 oct, 6/8 dic
CO: 20 jul, 7 ago, 8 dic
AR: 25 may, 9 jul, 8 dic
US: Memorial, 4 jul, Labor Day, Thanksgiving, Black Friday

HOJA DE SEGUIMIENTO
Fecha | Pieza | Canal | Objetivo | ¿Publicada? | Resultado
`,
    ),
    "brand-kit-freelance": fileFor(
      "brand-kit-freelance",
      "Brand kit — decisiones mínimas",
      `
NOMBRE PÚBLICO: ____________________
UNA FRASE: Ayudo a ______ a conseguir ______ sin ______.

PALETA (ejemplo Luna)
Tinta    #2A2118
Papel    #F4EBDD
Arcilla  #C45C26
Olivo    #5C6B4A
Arena    #E7D3B8

TIPOGRAFÍAS
Títulos: una serif con carácter (Fraunces, Newsreader, Source Serif).
Cuerpo: una sans limpia (Outfit, Figtree, Source Sans).

REGLAS
1. Un color de acento, no cuatro.
2. Fotos con la misma luz. Si no hay fotos, usa papel y tipo.
3. La propuesta comercial usa la misma portada que el Instagram.
4. Firma de correo: nombre, rol, un solo enlace, nada de banners.

WORDMARK
Escribe tu nombre en la serif, tracking amplio, minúsculas.
Eso ya es un logo si lo usas siempre igual.
`,
    ),
    "bundle-emprendedor": fileFor(
      "bundle-emprendedor",
      "Bundle Emprendedor — checklist de lanzamiento",
      `
FIN DE SEMANA 1
[ ] Elige nombre público y frase de una línea
[ ] Aplica paleta y tipografías a Canva
[ ] Sube avatar y portada
[ ] Escribe 3 paquetes de precio (bueno / mejor / completo)

FIN DE SEMANA 2
[ ] Duplica factura y presupuesto con tus datos
[ ] Publica 8 posts del pack (2 de oferta)
[ ] Pide un testimonio aunque sea de un favor
[ ] Pon el precio en la biografía, no “DM para info”

Este bundle incluye también los archivos del Brand kit,
el Kit de facturas y el Pack Instagram. Descárgalos uno a uno
desde la página del pedido.
`,
    ),
    "lista-de-precios": fileFor(
      "lista-de-precios",
      "Lista de precios — plantilla",
      `
OFICIO: ____________________
Válida desde: __________    Próxima revisión: __________

BUENO — US$ ______
Para quien necesita ______ . Incluye ______. Entrega en __ días.
No incluye ______.

MEJOR — US$ ______   (el que quieres vender)
Para quien necesita ______. Incluye el paquete Bueno más ______.
Cupos: __ al mes.

COMPLETO — US$ ______
Para equipos o lanzamientos. Incluye ______. Kickoff en 7 días.

EXTRAS
Urgencia (< 5 días hábiles): +30%
Reunión extra: US$ ______
Licencia comercial ampliada: US$ ______

TEXTO PARA WHATSAPP
Hola, trabajo con tres paquetes para que elijas sin cotizar
diez veces. Te los mando en un PDF de una página. ¿Te lo envío?
`,
    ),
  };

export function getDownload(slug: string) {
  const product = getProduct(slug);
  if (product && FILES[slug]) return FILES[slug];
  if (FILES[slug]) return FILES[slug];
  return fileFor(slug, product?.name ?? slug, "Archivo de demostración de Luna Atelier.");
}

export function downloadSlug(slug: string) {
  const file = getDownload(slug);
  const blob = new Blob([file.content], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
