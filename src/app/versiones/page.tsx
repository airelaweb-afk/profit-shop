import type { Metadata } from "next";
import { VersionQuoteTool } from "@/components/version-quote-tool";

export const metadata: Metadata = {
  title: "Versiones de un trabajo",
  description:
    "Un cliente, un encargo, varios presupuestos: básico, recomendado, completo, con o sin urgencia. Sin CRM.",
};

export default function VersionesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Herramienta · sin CRM
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Un trabajo. Varias ofertas. El cliente elige.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Escribe tu negocio, el cliente y tres paquetes (básico, recomendado,
        completo). Si quieres, cada uno también con recargo de urgencia. Luego
        imprime o guarda como PDF. Si es la primera vez, pulsa “Cargar ejemplo”
        y cambia los nombres.
      </p>
      <div className="mt-10">
        <VersionQuoteTool />
      </div>
    </div>
  );
}
