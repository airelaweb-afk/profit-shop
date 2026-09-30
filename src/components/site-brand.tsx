import Link from "next/link";
import { cn } from "cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 80"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="80" height="80" fill="#2430c9" />
      <path
        fill="#ff4b1a"
        fill-rule="evenodd"
        d="M30 16a26 26 0 1 0 0 52 26 26 0 0 0 0-52Zm16 8a20 20 0 1 0 0 36 20 20 0 0 0 0-36Z"
      />
      <circle cx="80" cy="8" r="8" fill="#ffe14a" />
    </svg>
  );
}

export function SiteBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-foreground">
      <LogoMark className={compact ? "size-8" : "size-10"} />
      <span className="leading-[0.9]">
        <span className="block font-heading text-[0.82rem] font-extrabold tracking-tight uppercase sm:text-[0.95rem]">
          Luna
        </span>
        <span className="block font-heading text-[0.82rem] font-extrabold tracking-tight text-primary uppercase sm:text-[0.95rem]">
          Oficio
        </span>
      </span>
    </Link>
  );
}
