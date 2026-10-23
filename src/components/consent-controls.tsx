"use client";

import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";

export function ConsentControls({ locale = "es" }: { locale?: "es" | "en" }) {
  const consent = useConsent();
  const en = locale === "en";
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <p className="font-heading text-xl text-foreground">
        {en ? "Your choice in this browser" : "Tu elección en este navegador"}
      </p>
      <p className="mt-2 text-sm">
        {consent.decidedAt
          ? consent.ads
            ? en
              ? "Right now: necessary + advertising."
              : "Ahora mismo: necesarias + publicidad."
            : en
              ? "Right now: necessary only."
              : "Ahora mismo: solo necesarias."
          : en
            ? "You have not chosen yet. The banner stays at the bottom until you do."
            : "Aún no has decidido. El banner aparece abajo hasta que elijas."}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => saveConsent(false)}
        >
          {en ? "Necessary only" : "Solo necesarias"}
        </Button>
        <Button type="button" className="h-11" onClick={() => saveConsent(true)}>
          {en ? "Accept advertising" : "Aceptar publicidad"}
        </Button>
      </div>
    </div>
  );
}
