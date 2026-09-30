"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";

export function CookieBanner() {
  const consent = useConsent();
  if (consent.decidedAt) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-50 border-t border-border/80 bg-background/95 p-4 shadow-lg backdrop-blur-md xl:bottom-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Usamos almacenamiento local para tu cuenta y tus archivos (no se van a
          ningún servidor nuestro). Si aceptas publicidad, más adelante podrán
          cargarse anuncios de terceros.{" "}
          <Link href="/cookies/" className="text-primary underline-offset-4 hover:underline">
            Política de cookies
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => saveConsent(false)}
          >
            Solo necesarias
          </Button>
          <Button type="button" className="h-11" onClick={() => saveConsent(true)}>
            Aceptar publicidad
          </Button>
        </div>
      </div>
    </div>
  );
}
