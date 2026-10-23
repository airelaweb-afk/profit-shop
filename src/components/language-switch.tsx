"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isEnglishPath, pairForPath } from "@/lib/locale";

function withSlash(path: string) {
  if (path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function LanguageSwitch({ className }: { className?: string }) {
  const pathname = usePathname() || "/";
  const english = isEnglishPath(pathname);
  const pair = pairForPath(pathname);
  const href = withSlash(english ? (pair?.es ?? "/") : (pair?.en ?? "/en"));
  const short = english ? "ES" : "EN";
  const label = english ? "Español" : "English";

  return (
    <Link
      href={href}
      prefetch={false}
      hrefLang={english ? "es" : "en"}
      lang={english ? "es" : "en"}
      className={className}
      aria-label={english ? "Versión en español" : "English version"}
    >
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
