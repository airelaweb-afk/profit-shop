import Link from "next/link";
import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { HomeToolGrid } from "@/components/home-tool-grid";
import { InkHero } from "@/components/ink-hero";
import { ToolCard } from "@/components/tool-card";
import { Button } from "@/components/ui/button";
import { posts } from "@/lib/blog";
import { siteFaqs } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Herramientas PDF e imagen online gratis, sin subir archivos",
  description:
    "Unir PDF, comprimir, HEIC a JPG, JPG a WebP, audio a WAV y firmar, en el navegador. Sin cuenta y sin subir el archivo.",
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
    "audio a wav",
  ],
});

const featuredPosts = posts.slice(0, 6);

export default function HomePage() {
  return (
    <div>
      <FaqJsonLd items={siteFaqs} />
      <InkHero />
      <HomeToolGrid />

      <section className="luna-wrap pb-16 pt-4">
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
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <section className="luna-wrap pb-16">
        <FaqList items={siteFaqs} />
      </section>
    </div>
  );
}
