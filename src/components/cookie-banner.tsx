"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/consent";
import { hasCloud } from "@/lib/supabase";
import { useConsent } from "@/lib/use-consent";

const cloud = hasCloud();

export function CookieBanner() {
  const consent = useConsent();
  if (consent.decidedAt) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-50 border-t-2 border-primary bg-foreground p-3 text-background sm:p-4 xl:bottom-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <p className="text-xs text-background/75 sm:text-sm">
          {cloud
            ? "Los archivos se procesan en este navegador y no se suben. Guardamos la sesión en tu aparato; la cuenta (si la creas) va a nuestra base de datos."
            : "Usamos almacenamiento local para la sesión, el consentimiento y, si activas Pro, la clave."}{" "}
          <Link href="/cookies/" className="text-accent underline-offset-4 hover:underline">
            Política de cookies
          </Link>
          .
        </p>
        <Button type="button" className="h-10 w-full shrink-0 sm:h-11 sm:w-auto" onClick={() => saveConsent(false)}>
          Entendido
        </Button>
      </div>
    </div>
  );
}
