import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { posts } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Blog: unir PDF, comprimir imagen y el atasco del autónomo",
  description:
    "Guías con las búsquedas reales: unir PDF, comprimir para el correo, HEIC a JPG, firmar sin Adobe. En el navegador, sin subir el archivo.",
  path: "/blog",
  keywords: ["unir pdf", "comprimir imagen", "heic a jpg", "firmar pdf guia"],
});

export default function BlogIndexPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Blog</p>
      <h1 className="mt-2 max-w-3xl font-heading text-4xl tracking-tight sm:text-5xl">
        Cómo se usa, con las palabras que busca la gente.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Unir PDF, comprimir, HEIC, presupuestos. Cada pieza enlaza a la
        herramienta. Los archivos no salen de tu navegador.
      </p>
      <div className="mt-8">
        <AdSlot label="Las herramientas de PDF están en el menú de arriba o en el muelle del teléfono." />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}/`}
              className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 hover:bg-muted/40"
            >
              <p className="text-sm tracking-wide text-primary uppercase">
                {post.kicker}
              </p>
              <p className="mt-2 font-heading text-2xl">{post.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{post.meta}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
