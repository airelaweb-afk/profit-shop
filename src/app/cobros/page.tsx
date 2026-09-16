import type { Metadata } from "next";
import { ReminderBatchTool } from "@/components/reminder-batch-tool";

export const metadata: Metadata = {
  title: "Recordatorios de cobro",
  description:
    "Pega quién te debe y genera una tanda de mensajes de WhatsApp o correo, serios y sin pelea. Sin CRM.",
};

export default function CobrosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">
        Herramienta · sin CRM
      </p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Quién te debe. Una tanda de recordatorios.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        No es un programa de cobros ni un tono agresivo. Eliges si es el primer
        aviso, el segundo o el último, pegas la lista y copias cada texto a
        WhatsApp o al correo. Tú lo envías. La herramienta no persigue a nadie.
      </p>
      <div className="mt-10">
        <ReminderBatchTool />
      </div>
    </div>
  );
}
