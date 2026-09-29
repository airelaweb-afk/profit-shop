import type { Metadata } from "next";
import { AuthGate } from "@/components/auth-gate";
import { ReminderBatchTool } from "@/components/reminder-batch-tool";

export const metadata: Metadata = {
  title: "Recordatorios de cobro",
  description:
    "Pega quién te debe y genera una tanda de mensajes de WhatsApp o correo, serios y sin pelea.",
};

export default function CobrosPage() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm tracking-wide text-primary uppercase">
          Herramienta · con cuenta
        </p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          Quién te debe. Una tanda de recordatorios.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Eliges si es el primer aviso, el segundo o el último. Pegas quién te
          debe (importe, fecha, teléfono o correo) y cada ficha tiene Copiar,
          WhatsApp y Correo. Tú lo envías. La web no persigue a nadie.
        </p>
        <div className="mt-10">
          <ReminderBatchTool />
        </div>
      </div>
    </AuthGate>
  );
}
