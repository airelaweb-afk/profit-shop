import { enBlogPairs } from "@/lib/en-blog";
import { enPagePairs } from "@/lib/en-catalog";
import { cleanPath } from "@/lib/nav";

export type Locale = "es" | "en";

const basePairs = [
  { es: "/", en: "/en" },
  { es: "/quitar-fondo", en: "/en/remove-background" },
  { es: "/unir-pdf", en: "/en/merge-pdf" },
  { es: "/comprimir-pdf", en: "/en/compress-pdf" },
  { es: "/heic-a-jpg", en: "/en/heic-to-jpg" },
  { es: "/comprimir-imagen", en: "/en/compress-image" },
  { es: "/blog", en: "/en/blog" },
] as const;

export const localePairs = [...basePairs, ...enPagePairs, ...enBlogPairs];

export type LocalePair = (typeof localePairs)[number];

export function pairForPath(pathname: string): LocalePair | null {
  const path = cleanPath(pathname);
  return localePairs.find((pair) => pair.es === path || pair.en === path) ?? null;
}

export function isEnglishPath(pathname: string) {
  const path = cleanPath(pathname);
  return path === "/en" || path.startsWith("/en/");
}
