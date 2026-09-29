const FALLBACK = "/pdf/";

export function safeNextPath(raw: string | null | undefined) {
  if (!raw) return FALLBACK;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return FALLBACK;
  }
  return raw;
}
