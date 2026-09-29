import type { Metadata } from "next";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { ImageKitTool } from "@/components/image-kit-tool";
import { audioKit, imageKit, type ImageKitSlug } from "@/lib/image-kit";

const copy: Record<
  ImageKitSlug,
  { title: string; kicker: string; lead: string; metaTitle: string; meta: string }
> = {
  compress: {
    metaTitle: "Comprimir imagen",
    meta: "Reduce el peso de JPG, PNG o WebP en el navegador. Sin subir la foto a un servidor.",
    kicker: "Comprimir imagen · con cuenta",
    title: "Que la foto entre en el formulario.",
    lead: "Bajas la calidad JPG o WebP y te la descargas. Un PNG a veces no adelgaza hasta pasarlo a JPG. Quitar el fondo o ampliar con IA no está: eso pide servidor.",
  },
  "to-jpg": {
    metaTitle: "PNG a JPG",
    meta: "Convierte PNG, WebP o HEIC a JPG en el navegador, sin subir el archivo.",
    kicker: "PNG a JPG · con cuenta",
    title: "Pásalo a JPG y listo para enviar.",
    lead: "PNG, WebP o HEIC. El transparente se rellena de blanco. El archivo no sale de este aparato.",
  },
  "to-png": {
    metaTitle: "JPG a PNG",
    meta: "Convierte JPG o WebP a PNG en el navegador.",
    kicker: "JPG a PNG · con cuenta",
    title: "De JPG a PNG.",
    lead: "Para un sello, un logo o un documento que pide PNG. Aquí mismo.",
  },
  "to-webp": {
    metaTitle: "JPG a WebP",
    meta: "Convierte JPG o PNG a WebP en el navegador, más ligero para la web.",
    kicker: "JPG a WebP · con cuenta",
    title: "JPG o PNG, a WebP.",
    lead: "Suele pesar menos que el JPG. Si el programa del cliente no abre WebP, usa JPG.",
  },
  heic: {
    metaTitle: "HEIC a JPG",
    meta: "Pasa fotos HEIC del iPhone a JPG en el navegador. El archivo no se sube a un servidor.",
    kicker: "HEIC a JPG · con cuenta",
    title: "La foto del iPhone, en JPG.",
    lead: "Windows y muchos correos no abren HEIC. Aquí lo conviertes. Tarda un momento la primera vez: carga el decodificador en este aparato.",
  },
  resize: {
    metaTitle: "Redimensionar imagen",
    meta: "Cambia el tamaño de una foto en el navegador, manteniendo la proporción.",
    kicker: "Redimensionar imagen · con cuenta",
    title: "Al tamaño que te piden.",
    lead: "Fijas ancho o alto. Por defecto se mantiene la proporción. No ampliamos con IA: agrandar un pixelado sigue pixelado.",
  },
  crop: {
    metaTitle: "Recortar imagen",
    meta: "Recorta una foto en el navegador. Marca el recuadro y descargas.",
    kicker: "Recortar imagen · con cuenta",
    title: "Quédate con el trozo que vale.",
    lead: "Pulsa y arrastra sobre la foto. Si pulsas dentro del recuadro, lo mueves. DNI, ticket, captura. Sin subirla a ningún sitio.",
  },
  rotate: {
    metaTitle: "Girar imagen",
    meta: "Gira fotos 90, 180 o 270 grados en el navegador.",
    kicker: "Girar imagen · con cuenta",
    title: "Endereza la foto del móvil.",
    lead: "90, 180 o 270 grados. Varias a la vez si quieres.",
  },
};

export function imageKitMetadata(kind: ImageKitSlug): Metadata {
  const item = copy[kind];
  return { title: item.metaTitle, description: item.meta };
}

export function ImageKitPage({ kind }: { kind: ImageKitSlug }) {
  const item = copy[kind];
  const others = [...imageKit.filter((tool) => tool.slug !== kind), ...audioKit];
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm tracking-wide text-primary uppercase">{item.kicker}</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{item.lead}</p>
        <div className="mt-10">
          <ImageKitTool kind={kind} />
        </div>
        <aside className="mt-14">
          <h2 className="font-heading text-2xl">Otras del mismo estilo</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((tool) => (
              <li key={tool.href}>
                <Link
                  href={tool.href}
                  className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:bg-muted/40"
                >
                  <p className="font-heading text-lg">{tool.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tool.does}</p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AuthGate>
  );
}
