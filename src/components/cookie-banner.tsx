"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/consent";
import { hasCloud } from "@/lib/supabase";
import { useLocale } from "@/lib/locale-context";
import { useConsent } from "@/lib/use-consent";

const cloud = hasCloud();

export function CookieBanner() {
  const consent = useConsent();
  const english = useLocale() === "en";
  if (consent.decidedAt) return null;

  return (
    <div
      role="region"
      aria-label={english ? "Cookie notice" : "Aviso de cookies"}
      className="luna-cookie-banner no-print fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-50 border-t-2 border-primary bg-foreground p-3 text-background sm:p-4 xl:bottom-0"
    >
      <div className="luna-wrap flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <p className="text-xs text-background/75 sm:text-sm">
          {english
            ? cloud
              ? "Files are processed in this browser and are not uploaded. The session stays on your device; an account, if you create one, is saved in our database."
              : "We use local storage for the session, your consent and, if you turn on Pro, the key."
            : cloud
              ? "Los archivos se procesan en este navegador y no se suben. Guardamos la sesión en tu aparato; la cuenta (si la creas) va a nuestra base de datos."
              : "Usamos almacenamiento local para la sesión, el consentimiento y, si activas Pro, la clave."}{" "}
          <Link href="/cookies/" prefetch={false} className="text-accent underline underline-offset-4 hover:text-background">
            {english ? "Cookie policy" : "Política de cookies"}
          </Link>
          .
        </p>
        <Button type="button" className="h-10 w-full shrink-0 sm:h-11 sm:w-auto" onClick={() => saveConsent(false)}>
          {english ? "Got it" : "Entendido"}
        </Button>
      </div>
    </div>
  );
}
