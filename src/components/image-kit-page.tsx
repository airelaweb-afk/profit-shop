import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { ImageKitTool } from "@/components/image-kit-tool";
import { ToolJsonLd } from "@/components/json-ld";
import { RemoveBackgroundTool } from "@/components/remove-background-tool";
import { RelatedGuides } from "@/components/related-guides";
import { faqsForPath } from "@/lib/faq";
import { audioKit, imageKit, type ImageKitSlug } from "@/lib/image-kit";
import { pageMeta, toolTitle } from "@/lib/seo";

const copy: Record<
  ImageKitSlug,
  {
    title: string;
    kicker: string;
    lead: string;
    metaTitle: string;
    meta: string;
    keywords: string[];
    steps?: string[];
    uses?: string[];
  }
> = {
  compress: {
    metaTitle: "Comprimir imagen",
    meta: "Reduce el peso de JPG, PNG o WebP en el navegador. Sin subir la foto a un servidor. Para sedes y formularios.",
    keywords: ["comprimir imagen", "reducir peso foto", "jpg demasiado pesado"],
    kicker: "Comprimir imagen · gratis",
    title: "Que la foto entre en el formulario.",
    lead: "Bajas la calidad JPG o WebP y te la descargas. Un PNG a veces no adelgaza hasta pasarlo a JPG. Ampliar con IA no está: eso pide servidor.",
  },
  "to-jpg": {
    metaTitle: "PNG a JPG",
    meta: "Convierte PNG, WebP o HEIC a JPG en el navegador, sin subir el archivo.",
    keywords: ["png a jpg", "convertir png a jpg", "png a jpeg"],
    kicker: "PNG a JPG · gratis",
    title: "Pásalo a JPG y listo para enviar.",
    lead: "PNG, WebP o HEIC. El transparente se rellena de blanco. El archivo no sale de este aparato.",
  },
  "to-png": {
    metaTitle: "JPG a PNG",
    meta: "Convierte JPG o WebP a PNG en el navegador, sin subir el archivo.",
    keywords: ["jpg a png", "convertir jpg a png"],
    kicker: "JPG a PNG · gratis",
    title: "Para el logo o el sello.",
    lead: "Para un sello, un logo o un documento que pide PNG. Aquí mismo.",
  },
  "to-webp": {
    metaTitle: "JPG a WebP",
    meta: "Convierte JPG o PNG a WebP en el navegador, más ligero para la web. Sin subir el archivo.",
    keywords: ["jpg a webp", "convertir a webp"],
    kicker: "JPG a WebP · gratis",
    title: "Más ligera para tu web.",
    lead: "Suele pesar menos que el JPG. Si el programa del cliente no abre WebP, usa JPG.",
  },
  heic: {
    metaTitle: "HEIC a JPG",
    meta: "Pasa fotos HEIC del iPhone a JPG en el navegador. Windows y muchos correos no abren HEIC. El archivo no se sube.",
    keywords: ["heic a jpg", "heic to jpg", "fotos iphone windows"],
    kicker: "HEIC a JPG · gratis",
    title: "La foto del iPhone, en JPG.",
    lead: "Windows y muchos correos no abren HEIC. Aquí lo conviertes. Tarda un momento la primera vez: carga el decodificador en este aparato.",
  },
  resize: {
    metaTitle: "Redimensionar imagen",
    meta: "Cambia el tamaño de una foto en el navegador, manteniendo la proporción. Sin subir el archivo.",
    keywords: ["redimensionar imagen", "cambiar tamaño foto"],
    kicker: "Redimensionar imagen · gratis",
    title: "Al tamaño que te piden.",
    lead: "Fijas ancho o alto. Por defecto se mantiene la proporción. No ampliamos con IA: agrandar un pixelado sigue pixelado.",
  },
  crop: {
    metaTitle: "Recortar imagen",
    meta: "Recorta una foto en el navegador. Marca el recuadro del DNI o el ticket y descargas. Sin subirla.",
    keywords: ["recortar imagen", "recortar foto dni", "crop imagen"],
    kicker: "Recortar imagen · gratis",
    title: "Quédate con el trozo que vale.",
    lead: "Pulsa y arrastra sobre la foto. Si pulsas dentro del recuadro, lo mueves. DNI, ticket, captura. Sin subirla a ningún sitio.",
  },
  rotate: {
    metaTitle: "Girar imagen",
    meta: "Gira fotos 90, 180 o 270 grados en el navegador. Sin subir el archivo.",
    keywords: ["girar imagen", "rotar foto"],
    kicker: "Girar imagen · gratis",
    title: "Endereza la foto del móvil.",
    lead: "90, 180 o 270 grados. Varias a la vez si quieres.",
  },
  cutout: {
    metaTitle: "Quitar fondo de una imagen",
    meta: "Quita el fondo de una foto online y gratis: descargas un PNG transparente en segundos. Se hace en tu navegador; la imagen no se sube a ningún servidor.",
    keywords: [
      "quitar fondo imagen",
      "quitar fondo foto gratis",
      "eliminar fondo imagen online",
      "fondo transparente png",
      "borrar fondo foto",
      "remove background",
    ],
    kicker: "Quitar fondo · gratis",
    title: "El fondo, fuera. La foto, aquí.",
    lead: "Una foto. Sale un PNG transparente. El modelo se descarga la primera vez en este aparato; la imagen no se envía a ningún servidor. El pelo fino puede quedar irregular.",
    steps: [
      "Pulsa Elegir foto (o Hacer foto ahora en el móvil): JPG, PNG, WebP o HEIC del iPhone.",
      "Espera unos segundos. La primera vez se descarga el modelo (unos 4 MB) y se queda en tu aparato.",
      "Mira el resultado sobre el fondo de cuadros: lo transparente es lo que se ha quitado.",
      "Pulsa Guardar PNG. Sale con fondo transparente, listo para ponerlo sobre otro color o en tu web.",
    ],
    uses: [
      "Fotos de producto para tu tienda online, Wallapop, Vinted o Etsy.",
      "Un logo o un sello escaneado que tiene que ir sobre otro fondo.",
      "Recortar a una persona para un cartel, una presentación o una tarjeta.",
      "Montajes rápidos sin abrir Photoshop ni instalar nada.",
    ],
  },
};

export function imageKitMetadata(kind: ImageKitSlug): Metadata {
  const item = copy[kind];
  const href = imageKit.find((tool) => tool.slug === kind)?.href ?? "/";
  return pageMeta({
    title: toolTitle(item.metaTitle),
    description: item.meta,
    path: href,
    keywords: item.keywords,
  });
}

export function ImageKitPage({ kind }: { kind: ImageKitSlug }) {
  const item = copy[kind];
  const href = imageKit.find((tool) => tool.slug === kind)?.href ?? "/";
  const others = [...imageKit.filter((tool) => tool.slug !== kind), ...audioKit];
  const faqs = faqsForPath(href);
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <ToolJsonLd
        name={item.metaTitle}
        description={item.meta}
        path={href}
        section={{ name: "Herramientas de imagen", path: "/herramientas-imagen" }}
      />
      <FaqJsonLd items={faqs} />
      <p className="text-sm tracking-wide text-primary uppercase">{item.kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {item.metaTitle}.{" "}
        <span className="text-primary">{item.title}</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{item.lead}</p>
      <AdSlot
        label={
          kind === "cutout"
            ? "Quitar el fondo es gratis."
            : "Comprimir y convertir fotos es gratis."
        }
        wrapClassName="mt-6"
      />
      <div className="mt-10">
        {kind === "cutout" ? <RemoveBackgroundTool /> : <ImageKitTool kind={kind} />}
      </div>
      {item.steps || item.uses ? (
        <section className="mt-14 grid gap-8 md:grid-cols-2">
          {item.steps ? (
            <div>
              <h2 className="font-heading text-2xl">
                Cómo {item.metaTitle.charAt(0).toLowerCase() + item.metaTitle.slice(1)}
              </h2>
              <ol className="mt-4 grid list-decimal gap-2 pl-5 text-muted-foreground">
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          ) : null}
          {item.uses ? (
            <div>
              <h2 className="font-heading text-2xl">Para qué se usa</h2>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-muted-foreground">
                {item.uses.map((use) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
      <FaqList items={faqs} />
      <RelatedGuides href={href} />
      <aside className="mt-14">
        <h2 className="font-heading text-2xl">Otras del mismo estilo</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="block punch-card p-4"
              >
                <p className="font-heading text-lg">{tool.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tool.does}</p>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
