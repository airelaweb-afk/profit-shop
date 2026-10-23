import { OfficePageShell } from "@/components/office-page-shell";
import { VersionQuoteTool } from "@/components/version-quote-tool";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Versiones de un trabajo",
  description:
    "Un cliente, un encargo, varios presupuestos: básico, recomendado, completo, con o sin urgencia. En el navegador.",
  path: "/versiones",
  keywords: ["presupuesto basico y premium", "varias versiones presupuesto"],
});

export default function VersionesPage() {
  return (
    <OfficePageShell
      kicker="Herramienta · gratis"
      title="Un trabajo. Varias ofertas. El cliente elige."
      lead="Distinto de la tanda: aquí hay un solo cliente y varias ofertas (básico, recomendado, completo, con o sin urgencia). El de “Presupuestos” es el mismo pack para mucha gente."
      href="/versiones"
    >
      <VersionQuoteTool />
    </OfficePageShell>
  );
}
