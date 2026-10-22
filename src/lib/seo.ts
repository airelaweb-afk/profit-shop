import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const SHARE_IMAGE = { url: "/brand/wordmark.jpg", width: 1376, height: 768 };

export function absUrl(path: string) {
  if (path === "/") return `${SITE_URL}/`;
  const withSlash = path.endsWith("/") ? path : `${path}/`;
  return `${SITE_URL}${withSlash}`;
}

export function pageMeta({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absUrl(path);
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: "es_ES",
      siteName: SITE_NAME,
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
export function toolTitle(name: string, free = true) {
  return free
    ? `${name} gratis y sin subir el archivo`
    : `${name} sin subir el archivo`;
}
