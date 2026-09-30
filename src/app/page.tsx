import Link from "next/link";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { HomeToolGrid } from "@/components/home-tool-grid";
import { InkHero } from "@/components/ink-hero";
import { PlanCompareTable } from "@/components/plan-compare-table";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/blog";
import { competitors } from "@/lib/comparisons";
import { siteFaqs } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Herramientas PDF e imagen online gratis, sin subir archivos",
  description:
    "Unir PDF, comprimir, HEIC a JPG, JPG a WebP y firmar, en el navegador. Sin cuenta y sin subir el archivo. Pro ilimitado: 7 €/mes o 40 €/año.",
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

const featuredPosts = posts.slice(0, 6);

export default function HomePage() {
  return (
    <div>
      <FaqJsonLd items={siteFaqs} />
      <InkHero />
      <HomeToolGrid />
      <PlanCompareTable />

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <p className="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
          Si has buscado el nombre de otro
        </p>
        <h2 className="mt-3 max-w-3xl font-heading text-3xl sm:text-4xl">
          No nos hacemos pasar por ellos. El archivo se queda aquí.
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {competitors.slice(0, 6).map((item) => (
            <li key={item.slug}>
              <Link
                href={item.href}
                className="block rounded-[2px] border-2 border-foreground/10 p-4 transition hover:-translate-x-1 hover:-translate-y-1 hover:border-primary hover:shadow-[6px_6px_0_0_#ff4b1a]"
              >
                <p className="font-heading text-xl">Frente a {item.name}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.search}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button variant="outline" className="h-11" render={<Link href="/comparar" />} nativeButton={false}>
            Ver comparativas
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl">Guías</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Cómo unir un PDF, bajar el peso de una foto o abrir un HEIC.
            </p>
          </div>
          <Button variant="outline" className="h-11" render={<Link href="/blog" />} nativeButton={false}>
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
