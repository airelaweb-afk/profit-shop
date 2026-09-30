import Link from "next/link";
import { Suspense } from "react";
import { AdSlot } from "@/components/ad-slot";
import { FaqList } from "@/components/faq-list";
import { ProGate } from "@/components/pro-gate";
import { WebpBatchTool } from "@/components/webp-batch-tool";
import { faqsForPath } from "@/lib/faq";
import { imageKit } from "@/lib/image-kit";
import { pageMeta } from "@/lib/seo";

const HREF = "/webp-en-lote";

export const metadata = pageMeta({
  title: "Convertir imágenes a WebP en lote (carpeta entera)",
  description:
    "Convierte cientos de JPG y PNG a WebP de una vez, con calidad y ancho máximo, y descarga un zip con los mismos nombres. En el navegador, sin subir nada. Herramienta Pro.",
  path: HREF,
  keywords: [
    "convertir imagenes a webp en lote",
    "convertir varias imagenes a webp",
    "carpeta a webp",
    "jpg a webp masivo",
    "png a webp masivo",
    "optimizar imagenes web",
  ],
});

const steps = [
  {
    title: "Elige la carpeta",
    text: "Arrastra las imágenes o pulsa «Elegir una carpeta». Se leen también las subcarpetas.",
  },
  {
    title: "Ajusta calidad y ancho",
    text: "Calidad 80 y 1600 px es lo habitual para contenido. Las imágenes pequeñas no se amplían.",
  },
  {
    title: "Baja el zip",
    text: "Mismos nombres con extensión .webp y, si quieres, la misma estructura de carpetas. Sustituyes y listo.",
  },
];

export default function WebpBatchPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">WebP en lote · Pro</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Toda la carpeta de imágenes a WebP, de una vez.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Para quien mantiene una web: hasta 300 JPG, PNG o HEIC por tanda, con
        la calidad y el ancho máximo que elijas, en un zip con los mismos
        nombres. Se convierten en tu navegador, así que no subes nada a ningún
        servidor. Si solo necesitas una imagen, la conversión sencilla{" "}
        <Link href="/jpg-a-webp" className="text-primary underline-offset-4 hover:underline">
          JPG a WebP
        </Link>{" "}
        es gratis.
      </p>
      <AdSlot label="JPG a WebP de una en una es gratis. El lote es Pro." wrapClassName="mt-6" />

      <div className="mt-10">
        <Suspense>
          <ProGate pitch="La conversión en lote es Pro: 7 €/mes o 40 €/año. Incluye el plugin de WordPress, la marca de agua en PDF y sin límites de archivos. Las imágenes no salen de tu navegador.">
            <WebpBatchTool />
          </ProGate>
        </Suspense>
      </div>

      <section className="mt-14">
        <h2 className="font-heading text-2xl">Cómo funciona</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="punch-card p-4">
              <p className="font-mono text-xs tracking-[0.18em] text-primary uppercase">
                Paso {index + 1}
              </p>
              <p className="mt-2 font-heading text-lg">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl">Por qué WebP</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Un WebP pesa entre un 25 y un 35 % menos que el JPG equivalente con
            la misma calidad visual, y mucho menos que un PNG con foto. Menos
            peso es menos tiempo de carga, mejor puntuación en PageSpeed y
            Core Web Vitals (LCP) y menos ancho de banda en el hosting. Todos
            los navegadores actuales lo abren, incluido Safari desde 2020.
          </p>
        </div>
        <div>
          <h2 className="font-heading text-2xl">Si quieres dejar un JPG de respaldo</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Con la etiqueta <code>picture</code> el navegador coge el WebP y,
            si no lo soporta, el original:
          </p>
          <pre className="mt-3 overflow-auto rounded-[2px] bg-foreground p-4 font-mono text-xs leading-relaxed text-background">
{`<picture>
  <source srcset="foto.webp" type="image/webp">
  <img src="foto.jpg" alt="Descripción" width="1600" height="1067" loading="lazy">
</picture>`}
          </pre>
        </div>
      </section>

      <section className="mt-14 rounded-[2px] border-2 border-foreground bg-accent p-5 text-accent-foreground sm:p-6">
        <p className="font-mono text-xs tracking-[0.18em] uppercase">¿Tu web es WordPress?</p>
        <h2 className="mt-2 font-heading text-2xl">
          Hay un plugin que hace esto dentro del propio WordPress.
        </h2>
        <p className="mt-2 max-w-2xl text-sm">
          Convierte a WebP cada imagen que subas y, con un botón, toda la
          biblioteca de medios existente, miniaturas incluidas. Va incluido en
          Pro.
        </p>
        <Link
          href="/plugin-wordpress-webp"
          className="mt-4 inline-flex h-11 items-center rounded-[2px] bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Ver el plugin de WordPress
        </Link>
      </section>

      <FaqList items={faqsForPath(HREF)} />

      <aside className="mt-14">
        <h2 className="font-heading text-2xl">Otras herramientas de imagen</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {imageKit.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="block punch-card p-4">
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
