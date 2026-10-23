import { OfficePageShell } from "@/components/office-page-shell";
import { ReminderBatchTool } from "@/components/reminder-batch-tool";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Recordatorios de cobro",
  description:
    "Pega quién te debe y genera mensajes de WhatsApp o correo: primera, segunda o última ronda. En el navegador.",
  path: "/cobros",
  keywords: ["recordatorio de cobro", "mensaje impago whatsapp", "cobrar a un cliente"],
});

export default function CobrosPage() {
  return (
    <OfficePageShell
      kicker="Herramienta · gratis"
      title="Quién te debe. Una tanda de recordatorios."
      lead="Eliges si es el primer aviso, el segundo o el último. Pegas quién te debe (importe, fecha, teléfono o correo) y cada ficha tiene Copiar, WhatsApp y Correo. Tú lo envías. La web no persigue a nadie."
      href="/cobros"
    >
      <ReminderBatchTool />
    </OfficePageShell>
  );
}
