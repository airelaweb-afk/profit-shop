import Link from "next/link";
import { cn } from "cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={cn("logo-mark shrink-0", className)}
      aria-hidden="true"
    >
      <rect width="80" height="80" fill="#12110f" />
      <g className="logo-moon origin-center">
        <path
          fill="#ff4b1a"
          fillRule="evenodd"
          d="M28 12a28 28 0 1 0 0 56 28 28 0 0 0 0-56Zm18 10a22 22 0 1 0 0 36 22 22 0 0 0 0-36Z"
        />
      </g>
      <circle className="logo-spark" cx="54" cy="26" r="10" fill="#ffe14a" />
    </svg>
  );
}

export function SiteBrand({
  compact = false,
  tone = "bone",
}: {
  compact?: boolean;
  tone?: "bone" | "ink";
}) {
  const ink = tone === "ink";
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5",
        ink ? "text-background" : "text-foreground",
      )}
    >
      <LogoMark
        className={cn(compact ? "size-8" : "size-10", ink && "ring-1 ring-accent")}
      />
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
