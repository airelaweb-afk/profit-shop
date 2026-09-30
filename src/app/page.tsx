import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { InkHero } from "@/components/ink-hero";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/blog";
import { competitors } from "@/lib/comparisons";
import { siteFaqs } from "@/lib/faq";
import { imageKit, imageProKit } from "@/lib/image-kit";
import { allPdfTools } from "@/lib/pdf-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Unir PDF, comprimir imagen y HEIC a JPG gratis, sin subir archivos",
  description:
    "Herramientas online gratis que funcionan en tu navegador: unir y comprimir PDF, comprimir imagen, HEIC a JPG, JPG a WebP, firmar PDF y documentos de trabajo. El archivo no se sube a ningún servidor.",
  path: "/",
  keywords: [
    "unir pdf",
    "comprimir pdf",
    "comprimir imagen",
    "heic a jpg",
    "firmar pdf",
    "jpg a webp",
    "juntar pdf",
    "herramientas pdf gratis",
    "alternativa a ilovepdf",
  ],
});

const tools = [
  {
    href: "/presupuestos",
    name: "Presupuestos",
    problem: "Hay que enviar el mismo presupuesto a varios clientes.",
    does: "Pegas la lista y sale un PDF por cliente, con tu logo.",
  },
  {
    href: "/versiones",
    name: "Versiones",
    problem: "El cliente quiere comparar opción básica, recomendada y completa.",
    does: "Un encargo, varias ofertas en el mismo PDF.",
  },
  {
    href: "/cobros",
    name: "Avisos de cobro",
    problem: "Tienes facturas pendientes y hay que reclamarlas con educación.",
    does: "Lista de impagos → mensaje listo, amable o último aviso.",
  },
  {
    href: "/horas",
    name: "Parte de horas",
    problem: "La semana está en notas sueltas y hay que justificarla.",
    does: "Un parte de horas en PDF para el cliente o el equipo.",
  },
  {
    href: "/gastos",
    name: "Relación de gastos",
    problem: "Los tickets están en un cajón y hace falta un resumen.",
    does: "Pegas fecha, tienda e importe. Sale base e IVA en PDF.",
  },
];

const featuredPosts = posts.slice(0, 6);

export default function HomePage() {
  return (
    <div>
      <FaqJsonLd items={siteFaqs} />
      <InkHero />

      <AdSlot
        label="Unir PDF, comprimir y HEIC a JPG son gratis."
        wrapClassName="mx-auto w-full max-w-6xl px-4 pt-12 sm:px-6"
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl">PDF, lo que más se busca</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Unir, dividir, comprimir, pasar fotos a PDF, rotar, numerar o quitar
          páginas. Todo gratis; la marca de agua es Pro. No convertimos a Word:
          quedaría mal y no lo vamos a fingir.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allPdfTools.map((tool) => (
            <li key={tool.href}>
              <ToolCard
                href={tool.href}
                name={tool.name}
                problem={tool.problem}
                does={tool.does}
                pro={"pro" in tool && tool.pro}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-foreground py-14 text-background">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="font-mono text-[0.7rem] tracking-[0.18em] text-accent uppercase">
            Si has buscado el nombre de otro
          </p>
          <h2 className="mt-3 max-w-3xl font-heading text-3xl sm:text-4xl">
            No nos hacemos pasar por ellos. Te decimos en qué nos diferenciamos.
          </h2>
          <p className="mt-4 max-w-2xl text-background/70">
            Quien teclea el nombre de un conversor famoso suele querer unir o
            comprimir un PDF. Esa búsqueda puede aterrizar aquí. Esta web se
            llama Luna Oficio; las fichas citan la marca ajena y un hecho
            comprobable: aquí el archivo se queda en tu navegador.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {competitors.slice(0, 6).map((item) => (
              <li key={item.slug}>
                <Link
                  href={item.href}
                  className="block rounded-[2px] border border-background/20 p-4 transition hover:-translate-x-1 hover:-translate-y-1 hover:border-accent hover:shadow-[6px_6px_0_0_#ff4b1a]"
                >
                  <p className="font-heading text-xl">Frente a {item.name}</p>
                  <p className="mt-2 text-sm text-background/65">{item.search}</p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button
              className="h-11 border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
              render={<Link href="/comparar" />}
              nativeButton={false}
            >
              Ver todas las comparativas
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl">Imágenes: comprimir, convertir, recortar</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Que la foto pese menos, que el HEIC del iPhone se abra en Windows, que
          el PNG sea JPG o WebP. Para webs, la conversión a WebP en lote es Pro.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...imageKit, ...imageProKit].map((tool) => (
            <li key={tool.href}>
              <ToolCard
                href={tool.href}
                name={tool.name}
                problem={tool.problem}
                does={tool.does}
                pro={"pro" in tool && tool.pro}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl">Documentos de trabajo en un minuto</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Pegas los datos y sale el PDF. Sin plantillas de Word ni programas de
          gestión: presupuestos, avisos de cobro, partes de horas y gastos.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.href}>
              <ToolCard
                href={tool.href}
                name={tool.name}
                problem={tool.problem}
                does={tool.does}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl">
              Guías paso a paso
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Cómo unir un PDF, bajar el peso de una foto para una sede
              electrónica, abrir un HEIC o reclamar un cobro sin discutir.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-11"
            render={<Link href="/blog" />}
            nativeButton={false}
          >
            Ver el blog
          </Button>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => (
            <li key={post.slug}>
              <ToolCard
                href={`/blog/${post.slug}/`}
                name={post.title}
                does={post.meta}
                kicker={post.kicker}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <FaqList items={siteFaqs} />
      </section>
    </div>
  );
}
