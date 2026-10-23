import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import { enPosts, getEnPost } from "@/lib/en-blog";
import { pageMeta } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return enPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getEnPost(slug);
  if (!post) return { title: "Article" };
  return pageMeta({
    title: post.title,
    description: post.meta,
    path: `/en/blog/${post.slug}`,
    keywords: post.keywords,
    locale: "en",
  });
}

export default async function EnBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getEnPost(slug);
  if (!post) notFound();

  const related = enPosts
    .filter((item) => item.slug !== post.slug && item.kicker === post.kicker)
    .slice(0, 2);
  const more =
    related.length > 0
      ? related
      : enPosts.filter((item) => item.slug !== post.slug).slice(0, 2);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en",
    keywords: post.keywords.join(", "),
    mainEntityOfPage: `${SITE_URL}/en/blog/${post.slug}/`,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <p className="text-sm tracking-wide text-primary uppercase">{post.kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {post.date} · {post.keywords.slice(0, 3).join(" · ")}
      </p>
      <AdSlot label="The tool in this guide is one click below." wrapClassName="mt-8" />
      <div className="mt-8 space-y-4 text-muted-foreground">
        {post.blocks.map((block, index) => {
          if (block.type === "p") {
            return (
              <p key={index} className="text-base leading-relaxed">
                {block.text}
              </p>
            );
          }
          if (block.type === "h2") {
            return (
              <h2 key={index} className="mt-8 font-heading text-2xl text-foreground">
                {block.text}
              </h2>
            );
          }
          if (block.type === "ul") {
            return (
              <ul key={index} className="list-disc space-y-2 pl-5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          return (
            <div
              key={index}
              className="rounded-2xl bg-card p-5 text-foreground ring-1 ring-foreground/10"
            >
              <p>{block.text}</p>
              <Button
                className="mt-4 h-11"
                render={<Link href={block.href} />}
                nativeButton={false}
              >
                {block.label}
              </Button>
            </div>
          );
        })}
      </div>
      {more.length > 0 ? (
        <aside className="mt-14">
          <h2 className="font-heading text-2xl">Keep reading</h2>
          <ul className="mt-4 grid gap-3">
            {more.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/en/blog/${item.slug}/`}
                  className="block rounded-xl bg-card p-4 ring-1 ring-foreground/10 hover:bg-muted/40"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
