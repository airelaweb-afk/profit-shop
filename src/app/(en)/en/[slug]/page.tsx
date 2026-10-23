import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EnSlugPage } from "@/components/en-slug-page";
import { enComparisons, enPages, getEnPage } from "@/lib/en-catalog";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return enPages.map((item) => ({ slug: item.slug }));
}

const fixedMeta: Record<string, { title: string; description: string; keywords?: string[] }> = {
  "pdf-tools": {
    title: "PDF tools free, in your browser",
    description: "Merge, split, compress, JPG to PDF, PDF to JPG, fill, edit text, sign, rotate, number and delete pages. The watermark is Pro. The file is never uploaded.",
    keywords: ["pdf tools", "merge pdf", "compress pdf", "sign pdf"],
  },
  "image-tools": {
    title: "Image tools free, in your browser",
    description: "Compress, convert, resize, crop and rotate photos. Remove a background. The file is never uploaded.",
    keywords: ["image tools", "compress image", "heic to jpg", "png to jpg"],
  },
  faq: {
    title: "Questions",
    description: "Are PDFs uploaded? Is there PDF to Word? What is Pro? Answers from Luna Oficio: files stay in the browser.",
    keywords: ["merge pdf safe", "pdf to word", "luna oficio questions"],
  },
  pricing: {
    title: "Pricing: Pro 7 €/month or 40 €/year",
    description: "Luna Oficio is free to merge a PDF, compress and sign, without an account. Unlimited Pro: 7 € a month or 40 € a year. Watermark, batch WebP and a WordPress plugin.",
    keywords: ["luna oficio pro", "unlimited merge pdf price", "wordpress webp plugin price"],
  },
  "how-it-works": {
    title: "How it works",
    description: "Small tools for paperwork, without a CRM: merge a PDF and write quotes in the browser. Files are not uploaded.",
  },
  contact: {
    title: "Contact",
    description: "Contact Luna Oficio by email. There is no chat and no 24-hour phone line.",
  },
  compare: {
    title: "Comparisons: merge a PDF without uploading it",
    description: "Luna Oficio is not iLovePDF, Smallpdf or PDF24. We compare one fact: the file stays in your browser. Third-party brands are identified.",
    keywords: ["merge pdf without uploading", "pdf in the browser", "compare pdf tools"],
  },
  "legal-notice": {
    title: "Legal notice",
    description: "Legal notice for Luna Oficio: who publishes the site, and how the browser tools may be used. The Spanish text is binding.",
  },
  privacy: {
    title: "Privacy",
    description: "Privacy policy for Luna Oficio. Files stay in your browser. The Spanish text is binding.",
  },
  cookies: {
    title: "Cookies",
    description: "Cookie policy for Luna Oficio: necessary local storage and optional advertising. The Spanish text is binding.",
  },
  terms: {
    title: "Terms",
    description: "Terms of use for Luna Oficio: free tools and Pro. The Spanish text is binding.",
  },
  "wordpress-webp": {
    title: "WordPress plugin to convert images to WebP",
    description: "A WordPress plugin that converts uploads and the whole media library to WebP, including thumbnails, and updates the URLs. Included in Luna Oficio Pro.",
    keywords: ["wordpress webp plugin", "convert images to webp wordpress", "media library webp"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getEnPage(slug);
  if (!page) return { title: "Page" };
  if (page.kind === "compare-one" && page.competitor) {
    const item = enComparisons.find((entry) => entry.slug === page.competitor);
    if (!item) return { title: "Comparison" };
    return pageMeta({
      title: item.title,
      description: item.meta,
      path: item.href,
      keywords: [...item.keywords],
      locale: "en",
    });
  }
  if (page.copy) {
    return pageMeta({
      title: page.copy.metaTitle,
      description: page.copy.meta,
      path: page.copy.path,
      keywords: page.copy.keywords,
      locale: "en",
    });
  }
  const fixed = fixedMeta[slug];
  if (!fixed) return { title: page.name };
  return pageMeta({
    title: fixed.title,
    description: fixed.description,
    path: page.en,
    keywords: fixed.keywords,
    locale: "en",
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getEnPage(slug)) notFound();
  return <EnSlugPage slug={slug} />;
}
