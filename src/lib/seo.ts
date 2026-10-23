import type { Metadata } from "next";
import { pairForPath, type Locale } from "@/lib/locale";
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
  locale = "es",
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  locale?: Locale;
}): Metadata {
  const url = absUrl(path);
  const pair = pairForPath(path);
  const languages = pair
    ? {
        es: absUrl(pair.es),
        en: absUrl(pair.en),
        "x-default": absUrl(pair.es),
      }
    : undefined;
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: languages ? { canonical: url, languages } : { canonical: url },
    openGraph: {
      title,
      description,
      url,
      locale: locale === "en" ? "en_US" : "es_ES",
      alternateLocale: languages ? (locale === "en" ? ["es_ES"] : ["en_US"]) : undefined,
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
