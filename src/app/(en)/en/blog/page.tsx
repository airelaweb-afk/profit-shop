import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { enPosts } from "@/lib/en-blog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Blog: guides for merging PDFs, compressing images and work documents",
  description:
    "Guides for the searches people actually type: merge PDF, compress for email, HEIC to JPG, sign without Adobe. In the browser, without uploading the file.",
  path: "/en/blog",
  keywords: ["merge pdf", "compress image", "heic to jpg", "sign pdf guide"],
  locale: "en",
});

export default function EnBlogIndexPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Blog</p>
      <h1 className="mt-2 max-w-3xl font-heading text-4xl tracking-tight sm:text-5xl">
        How to use it, in the words people search for.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Merge a PDF, compress a file, convert HEIC, write a quote. Each guide
        links to the tool. The file does not leave your browser.
      </p>
      <AdSlot
        label="The PDF tools are in the menu above or in the phone dock."
        wrapClassName="mt-8"
      />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {enPosts.map((post) => (
          <li key={post.slug}>
            <ToolCard
              href={`/en/blog/${post.slug}/`}
              name={post.title}
              does={post.meta}
              kicker={post.kicker}
              openLabel="Read"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
