import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/blog";
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
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-sm tracking-wide text-primary uppercase">
          Herramientas admin · autónomos y secretaría
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Unir PDF, comprimir la foto y el presupuesto del martes. En este
          navegador.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          No es un CRM. Entras con una cuenta de este aparato y usas la
          herramienta del atasco de hoy. Los archivos se quedan aquí, no en un
          servidor nuestro. Lo que se busca: unir, comprimir, HEIC, firmar.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-12 w-full px-5 sm:w-auto"
            render={<Link href="/unir-pdf" />}
            nativeButton={false}
          >
            Unir PDF
            <ArrowRight />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full px-5 sm:w-auto"
            render={<Link href="/comprimir-imagen" />}
            nativeButton={false}
          >
            Comprimir imagen
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full px-5 sm:w-auto"
            render={<Link href="/entrar/?tab=crear" />}
            nativeButton={false}
          >
            Crear cuenta
          </Button>
        </div>
        <div className="mt-8">
          <AdSlot label="Las búsquedas gordas (unir, comprimir, HEIC) son gratis." />
        </div>
        <div className="mt-10 flex h-3 max-w-xs" aria-hidden="true">
          <span className="flex-1 bg-primary" />
          <span className="flex-1 bg-secondary" />
          <span className="w-10 bg-accent" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl">PDF, lo que más se busca</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Unir, comprimir, foto a PDF, rotar, numerar. Marca de agua es Pro. No
          convertimos a Word: quedaría mal.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allPdfTools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
              >
                <p className="font-heading text-xl">
                  {tool.name}
                  {"pro" in tool && tool.pro ? (
                    <span className="ml-2 text-sm font-sans tracking-wide text-primary uppercase">
                      Pro
                    </span>
                  ) : null}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {tool.problem}
                </p>
                <p className="mt-2 text-sm">{tool.does}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Abrir
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
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
              <Link
                href={tool.href}
                className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
              >
                <p className="font-heading text-xl">{tool.name}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {tool.problem}
                </p>
                <p className="mt-2 text-sm">{tool.does}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Abrir
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
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
              <Link
                href={tool.href}
                className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
              >
                <p className="font-heading text-xl">{tool.name}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {tool.problem}
                </p>
                <p className="mt-2 text-sm">{tool.does}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Abrir
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
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
              <Link
                href={`/blog/${post.slug}/`}
                className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 hover:bg-muted/40"
              >
                <p className="text-sm tracking-wide text-primary uppercase">
                  {post.kicker}
                </p>
                <p className="mt-2 font-heading text-xl">{post.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{post.meta}</p>
              </Link>
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
