import { OfficePageShell } from "@/components/office-page-shell";
import { TimesheetTool } from "@/components/timesheet-tool";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Parte de horas",
  description:
    "Pega las horas de la semana y saca un parte limpio para el cliente o el jefe. Sin fichaje. En el navegador.",
  path: "/horas",
  keywords: ["parte de horas", "plantilla horas autonomo", "horas trabajadas pdf"],
});

export default function HorasPage() {
  return (
    <OfficePageShell
      kicker="Herramienta · con cuenta"
      title="Las horas de la semana, en un papel."
      lead="Quien lleva la administración no quiere un fichaje. Quiere pegar lo que hizo, ver el total y mandarlo. Guardas el PDF y lo adjuntas tú."
      href="/horas"
    >
      <TimesheetTool />
    </OfficePageShell>
  );
}
