"use client";

import { Button } from "@/components/ui/button";
import { saveConsent } from "@/lib/consent";
import { useConsent } from "@/lib/use-consent";

export function ConsentControls() {
  const consent = useConsent();
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <p className="font-heading text-xl text-foreground">Tu elección en este navegador</p>
      <p className="mt-2 text-sm">
        {consent.decidedAt
          ? consent.ads
            ? "Ahora mismo: necesarias + publicidad."
            : "Ahora mismo: solo necesarias."
          : "Aún no has decidido. El banner aparece abajo hasta que elijas."}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
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
  );
}
