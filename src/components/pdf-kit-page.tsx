import type { Metadata } from "next";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { PdfKitTool } from "@/components/pdf-kit-tool";
import { pdfKit, type PdfKitSlug } from "@/lib/pdf-kit";

const copy: Record<
  Exclude<PdfKitSlug, "sign">,
  { title: string; kicker: string; lead: string; metaTitle: string; meta: string }
> = {
  merge: {
    metaTitle: "Unir PDF",
    meta: "Une varios PDF en uno solo, en el navegador. Sin subir el archivo a un servidor.",
    kicker: "Unir PDF · con cuenta",
    title: "Unir PDF. En este ordenador.",
    lead: "Arrastra dos o más PDF, ordénalos y descargas uno. No pasa por nuestros servidores. No convertimos a Word: eso, en el navegador, queda mal.",
  },
  split: {
    metaTitle: "Dividir PDF",
    meta: "Extrae páginas de un PDF o parte cada hoja en un archivo. Todo en el navegador.",
    kicker: "Dividir PDF · con cuenta",
    title: "Saca las páginas que te hacen falta.",
    lead: "Un rango (1-3, 5) o un PDF por página. El original no se envía a ningún sitio.",
  },
  compress: {
    metaTitle: "Comprimir PDF",
    meta: "Reduce el peso de un PDF en el navegador para que entre en el correo.",
    kicker: "Comprimir PDF · con cuenta",
    title: "Que el PDF entre en el correo.",
    lead: "La compresión ligera reescribe el archivo y mantiene el texto. La fuerte lo convierte en fotos: baja más, pero ya no se selecciona el texto. No es Ghostscript de Adobe; para un escaneo o un PDF hinchado suele bastar.",
  },
  images: {
    metaTitle: "JPG a PDF",
    meta: "Pasa fotos JPG o PNG a un PDF A4 en el navegador, sin subirlas a un servidor.",
    kicker: "JPG a PDF · con cuenta",
    title: "Fotos a un PDF, listo para mandar.",
    lead: "JPG o PNG, en el orden que elijas. Cada imagen entra en una hoja A4. El archivo no sale de este navegador.",
  },
  "to-images": {
    metaTitle: "PDF a JPG",
    meta: "Convierte cada página de un PDF en un JPG. Descarga un zip. En el navegador.",
    kicker: "PDF a JPG · con cuenta",
    title: "Cada página, una foto.",
    lead: "Útil para WhatsApp o un formulario que pide imagen. Te bajas un zip. El PDF no se sube a ningún servidor.",
  },
};

export function pdfKitMetadata(kind: Exclude<PdfKitSlug, "sign">): Metadata {
  const item = copy[kind];
  return { title: item.metaTitle, description: item.meta };
}

export function PdfKitPage({ kind }: { kind: Exclude<PdfKitSlug, "sign"> }) {
  const item = copy[kind];
  const others = pdfKit.filter((tool) => tool.slug !== kind);
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm tracking-wide text-primary uppercase">{item.kicker}</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{item.lead}</p>
        <div className="mt-10">
          <PdfKitTool kind={kind} />
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
