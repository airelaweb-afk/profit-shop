import { notFound } from "next/navigation";
import { CompareShell } from "@/components/compare-shell";
import { competitors, getCompetitor } from "@/lib/comparisons";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-static";

export function generateStaticParams() {
  return competitors.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getCompetitor(slug);
  if (!item) return {};
  return pageMeta({
    title: item.title,
    description: item.meta,
    path: item.href,
    keywords: item.keywords,
  });
}

export default async function AlternativaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getCompetitor(slug);
  if (!item) notFound();
  return <CompareShell item={item} />;
}
