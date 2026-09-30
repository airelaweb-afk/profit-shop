import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { FaqList } from "@/components/faq-list";
import { PluginDownload } from "@/components/plugin-download";
import { faqsForPath } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

const HREF = "/plugin-wordpress-webp";

export const metadata = pageMeta({
  title: "Plugin WordPress para convertir imágenes a WebP (biblioteca entera)",
  description:
    "Plugin de WordPress que convierte a WebP las imágenes que subes y toda la biblioteca de medios por lotes, miniaturas incluidas, y actualiza las URL. Sin servicios externos. Incluido en Luna Oficio Pro.",
  path: HREF,
  keywords: [
    "plugin wordpress webp",
    "convertir imagenes a webp wordpress",
    "optimizar imagenes wordpress",
    "webp wordpress sin plugin externo",
    "biblioteca de medios webp",
  ],
});

const features = [
  {
    title: "Al subir, ya en WebP",
    text: "Cada JPG o PNG que entra en la biblioteca se convierte con todas sus miniaturas. No cambias tu forma de trabajar.",
  },
  {
    title: "Toda la biblioteca, por lotes",
    text: "Un botón recorre lo que ya tenías subido en tandas pequeñas, con progreso y registro. Si se corta, sigue donde lo dejó.",
  },
  {
    title: "Las URL se actualizan",
    text: "Entradas, páginas y campos personalizados (serializados o JSON de maquetadores) pasan a apuntar al .webp.",
  },
  {
    title: "Con marcha atrás",
    text: "Por defecto conserva los originales. «Restaurar originales» deshace la conversión en un clic, de una imagen o de todas.",
  },
  {
    title: "Nunca empeora",
    text: "Si el WebP pesa más que el original (PNG muy simples), lo deja como estaba. Calidad configurable, 82 por defecto.",
  },
  {
    title: "Solo tu servidor",
    text: "Usa la GD o Imagick de tu hosting. Ni claves de licencia ni imágenes viajando a una API externa.",
  },
];

export default function PluginWordpressWebpPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Plugin WordPress · Pro</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Toda la biblioteca de medios de WordPress a WebP.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Un plugin ligero que convierte a WebP lo que subes y, por lotes, lo que
        ya tenías, miniaturas incluidas, y reescribe las URL para que las
        entradas sigan cargando. Menos peso, mejor PageSpeed y Core Web
        Vitals, sin pagar una API externa por imagen. Incluido en{" "}
        <Link href="/precios" className="text-primary underline-offset-4 hover:underline">
          Luna Oficio Pro
        </Link>
        .
      </p>
      <AdSlot label="El plugin de WordPress forma parte de Pro." wrapClassName="mt-6" />

      <div className="mt-10">
        <PluginDownload />
      </div>

      <section className="mt-14">
        <h2 className="font-heading text-2xl">Qué hace</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => (
            <li key={item.title} className="punch-card p-4">
              <p className="font-heading text-lg">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl">Requisitos</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>WordPress 5.8 o superior.</li>
            <li>PHP 7.4 o superior.</li>
            <li>GD con soporte WebP o Imagick con WebP (lo habitual en cualquier hosting actual; el plugin lo comprueba y te avisa).</li>
            <li>Una copia de seguridad antes de convertir la biblioteca entera. Siempre.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading text-2xl">Qué no hace</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <li>No convierte GIF animados ni SVG (no tiene sentido).</li>
            <li>No genera AVIF; WebP es el formato que hoy abre todo navegador.</li>
            <li>No reescribe las URL guardadas en opciones del tema (fondos o logotipos elegidos por URL): esas hay que volver a seleccionarlas.</li>
            <li>No sirve WebP «al vuelo» con reglas de servidor: cambia los archivos de verdad, que es lo que dura.</li>
          </ul>
        </div>
      </section>

      <section className="mt-14 rounded-[2px] border-2 border-foreground bg-foreground p-5 text-background sm:p-6">
        <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">¿La web no es WordPress?</p>
        <h2 className="mt-2 font-heading text-2xl">
          Convierte la carpeta de imágenes en el navegador.
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-background/75">
          WebP en lote coge cientos de JPG y PNG, los pasa a WebP con el ancho
          máximo que elijas y te devuelve un zip con los mismos nombres. También
          es Pro.
        </p>
        <Link
          href="/webp-en-lote"
          className="mt-4 inline-flex h-11 items-center rounded-[2px] bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          Abrir WebP en lote
        </Link>
      </section>

      <FaqList items={faqsForPath(HREF)} />
    </div>
  );
}
