"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const moreLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "Preguntas" },
  { href: "/como-funciona", label: "Cómo funciona" },
] as const;

export function MoreMenu({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ink = tone === "ink";

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        className={`ink-link inline-flex items-center gap-0.5 ${ink ? "" : "text-foreground"}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        Más
        <ChevronDown className={`size-3.5 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-[2px] border-2 border-foreground bg-card py-1 text-foreground shadow-[6px_6px_0_0_#ff4b1a]"
        >
          {moreLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              className="block px-4 py-2.5 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
