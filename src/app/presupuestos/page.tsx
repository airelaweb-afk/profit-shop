import { OfficePageShell } from "@/components/office-page-shell";
import { QuoteBatchTool } from "@/components/quote-batch-tool";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Tanda de presupuestos",
  description:
    "Genera hasta 30 presupuestos a la vez para autónomos. Pegas la lista, sales con un PDF por cliente. Sin CRM, en el navegador.",
  path: "/presupuestos",
  keywords: ["hacer presupuestos", "varios presupuestos a la vez", "plantilla presupuesto autonomo"],
});

export default function PresupuestosPage() {
  return (
    <OfficePageShell
      kicker="Herramienta · con cuenta"
      title="Presupuestos que se pueden mandar."
      lead="La web no manda el presupuesto por ti: no tiene tu correo ni WhatsApp. Guardas el PDF, copias el mensaje y lo adjuntas tú, como harías con un Word. Abajo tienes los botones de cada cliente."
      href="/presupuestos"
    >
      <QuoteBatchTool />
    </OfficePageShell>
  );
}
