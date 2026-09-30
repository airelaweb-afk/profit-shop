import { OfficePageShell } from "@/components/office-page-shell";
import { ExpenseTool } from "@/components/expense-tool";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Relación de gastos",
  description:
    "Pega los tickets del mes y saca una lista con base e IVA para el gestor. Sin Excel. En el navegador.",
  path: "/gastos",
  keywords: ["relacion de gastos", "relacion de gastos iva", "tickets gestor"],
});

export default function GastosPage() {
  return (
    <OfficePageShell
      kicker="Herramienta · gratis"
      title="Los tickets del mes, listos para el gestor."
      lead="Pegas fecha, tienda, lo que pagaste y el IVA. Sale la base, el IVA y el total. Guardas el PDF. No sustituye a la contabilidad: ordena el caos del cajón."
      href="/gastos"
    >
      <ExpenseTool />
    </OfficePageShell>
  );
}
