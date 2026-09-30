import { CompareShell } from "@/components/compare-shell";
import { getCompetitor } from "@/lib/comparisons";
import { pageMeta } from "@/lib/seo";

export function compareMetadata(slug: string) {
  const item = getCompetitor(slug);
  if (!item) throw new Error(`Unknown competitor: ${slug}`);
  return pageMeta({
    title: item.title,
    description: item.meta,
    path: item.href,
    keywords: item.keywords,
  });
}

export function ComparePage({ slug }: { slug: string }) {
  const item = getCompetitor(slug);
  if (!item) throw new Error(`Unknown competitor: ${slug}`);
  return <CompareShell item={item} />;
}
