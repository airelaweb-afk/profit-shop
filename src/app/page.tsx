import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { InkHero } from "@/components/ink-hero";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/blog";
import { competitors } from "@/lib/comparisons";
import { siteFaqs } from "@/lib/faq";
import { imageKit } from "@/lib/image-kit";
import { allPdfTools } from "@/lib/pdf-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Unir PDF, comprimir imagen y presupuestos en el navegador",
  description:
    "Herramientas admin para autónomos: unir PDF, comprimir, HEIC a JPG, firmar y presupuestos. Los archivos se quedan en tu navegador.",
  path: "/",
  keywords: [
    "unir pdf",
    "comprimir pdf",
    "comprimir imagen",
    "heic a jpg",
    "firmar pdf",
    "presupuestos autonomos",
    "juntar pdf",
    "alternativa a ilovepdf",
  ],
});

const tools = [
  {
    href: "/presupuestos",
    name: "Presupuestos",
    problem: "Tengo que mandar el mismo trabajo a diez clientes.",
    does: "Pegar la lista. Un PDF por cliente, con tu logo.",
  },
  {
    href: "/versiones",
    name: "Versiones",
    problem: "El cliente quiere ver básico, recomendado y urgente.",
    does: "Un encargo, varias ofertas. Elige en el papel.",
  },
  {
    href: "/cobros",
    name: "Cobros",
    problem: "Me deben y no quiero pelearme por WhatsApp.",
    does: "Lista de impagos → mensaje listo, amable o último aviso.",
  },
  {
    href: "/horas",
    name: "Horas",
    problem: "La semana se me ha ido en notas sueltas.",
    does: "Un parte de horas para el cliente o el jefe.",
  },
  {
    href: "/gastos",
    name: "Gastos",
    problem: "El gestor me pide los tickets y los tengo en el cajón.",
    does: "Pegas fecha, tienda e importe. Sale base e IVA.",
  },
];

const featuredPosts = posts.slice(0, 6);

export default function HomePage() {
  return (
    <div>
      <FaqJsonLd items={siteFaqs} />
      <InkHero />

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <AdSlot label="Las búsquedas gordas (unir, comprimir, HEIC) son gratis." />
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
            Quien teclea un conversor famoso suele querer unir o comprimir un
            PDF. Esa búsqueda puede aterrizar aquí. El nombre de esta web es
            Luna Oficio. Las fichas citan la marca ajena y un hecho: el archivo
            se queda en tu navegador.
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
        <h2 className="font-heading text-2xl sm:text-3xl">PDF, lo que más se busca</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Unir, comprimir, foto a PDF, rotar, numerar. Marca de agua es Pro. No
          convertimos a Word: quedaría mal.
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

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl">Fotos, lo de cada martes</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Comprimir, PNG a JPG, HEIC del iPhone. Quitar fondo e IA, no.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imageKit.map((tool) => (
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
        <h2 className="font-heading text-2xl sm:text-3xl">Oficio, sin CRM</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Entras con tu cuenta y abres la del atasco de hoy. Si no sirve, se
          corrige. Si sirve, se queda.
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
              Cómo se usa, con las palabras que busca la gente
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Guías long-tail: unir PDF, sede electrónica, HEIC, cobros.
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
