import { cleanPath } from "@/lib/nav";

export type Locale = "es" | "en";

export const localePairs = [
  { es: "/", en: "/en" },
  { es: "/quitar-fondo", en: "/en/remove-background" },
  { es: "/unir-pdf", en: "/en/merge-pdf" },
  { es: "/comprimir-pdf", en: "/en/compress-pdf" },
  { es: "/heic-a-jpg", en: "/en/heic-to-jpg" },
  { es: "/comprimir-imagen", en: "/en/compress-image" },
] as const;

export type LocalePair = (typeof localePairs)[number];

export function pairForPath(pathname: string): LocalePair | null {
  const path = cleanPath(pathname);
  return localePairs.find((pair) => pair.es === path || pair.en === path) ?? null;
}

export function isEnglishPath(pathname: string) {
  const path = cleanPath(pathname);
  return path === "/en" || path.startsWith("/en/");
}
