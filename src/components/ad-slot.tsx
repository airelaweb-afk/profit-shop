"use client";

import Link from "next/link";
import { useConsent, usePro } from "@/lib/use-consent";

export function AdSlot({ label }: { label: string }) {
  const consent = useConsent();
  const pro = usePro();
  if (pro) return null;
  if (!consent.ads) return null;

  return (
    <aside className="no-print rounded-[2px] border-2 border-foreground bg-accent px-4 py-3 text-sm text-foreground">
      <p className="text-xs tracking-wide uppercase">Publicidad</p>
      <p className="mt-1">
        {label}{" "}
        <Link href="/precios/" className="text-primary underline-offset-4 hover:underline">
          Sin anuncios con Pro
        </Link>
        .
      </p>
    </aside>
  );
}
