"use client";

import Link from "next/link";
import { useConsent, usePro } from "@/lib/use-consent";

export function AdSlot({ label }: { label: string }) {
  const consent = useConsent();
  const pro = usePro();
  if (pro) return null;
  if (!consent.ads) return null;

  return (
    <aside className="no-print rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground ring-1 ring-foreground/10">
      <p className="text-xs tracking-wide uppercase">Publicidad</p>
      <p className="mt-1">
        {label}{" "}
        <Link href="/precios/" className="text-primary underline-offset-4 hover:underline">
          Pro quita los anuncios
        </Link>
        , en este navegador.
      </p>
    </aside>
  );
}
