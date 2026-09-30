import Link from "next/link";
import { postsForTool } from "@/lib/blog";

export function RelatedGuides({ href }: { href: string }) {
  const related = postsForTool(href);
  if (related.length === 0) return null;
  return (
    <aside className="mt-14">
      <h2 className="font-heading text-2xl">Cómo se usa (y por qué se busca)</h2>
      <ul className="mt-4 grid gap-3">
        {related.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}/`}
              className="punch-card block p-4"
            >
              <p className="font-heading text-lg">{post.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{post.meta}</p>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
