"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";

export function CookieBanner() {
  const consent = useConsent();
  if (consent.decidedAt) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-50 border-t-2 border-primary bg-foreground p-3 text-background sm:p-4 xl:bottom-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <p className="text-xs text-background/75 sm:text-sm">
          Usamos almacenamiento local para tu cuenta y tus archivos (no se van a
          ningún servidor nuestro). Si aceptas publicidad, más adelante podrán
          cargarse anuncios de terceros.{" "}
          <Link href="/cookies/" className="text-accent underline-offset-4 hover:underline">
            Política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 border-background/40 bg-transparent text-background hover:border-accent hover:bg-transparent hover:text-accent sm:h-11 sm:flex-none"
            onClick={() => saveConsent(false)}
          >
            Solo necesarias
          </Button>
          <Button type="button" className="h-10 flex-1 sm:h-11 sm:flex-none" onClick={() => saveConsent(true)}>
            Aceptar publicidad
          </Button>
        </div>
      </div>
    </div>
  );
}
