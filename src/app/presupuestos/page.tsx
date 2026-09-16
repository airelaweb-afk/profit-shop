import type { Metadata } from "next";
import { QuoteBatchTool } from "@/components/quote-batch-tool";

export const metadata: Metadata = {
  title: "Tanda de presupuestos",
  description:
    "Genera hasta 30 presupuestos a la vez para autónomos y pequeños negocios. Sin CRM, sin cuenta, sin enviar tus datos.",
};

export default function PresupuestosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Herramienta · sin CRM
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Una lista de clientes. Una tanda de presupuestos.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Esto no es “versiones”: aquí los servicios son los mismos y cambia el
        destinatario. Sube el logo, rellena tus datos, pega la lista e imprime
        (o guarda PDF). Cada papel lleva cabecera, IVA y condiciones.
      </p>
      <div className="mt-10">
        <QuoteBatchTool />
      </div>
    </div>
  );
}
