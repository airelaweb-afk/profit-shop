import type { Metadata } from "next";
import { TimesheetTool } from "@/components/timesheet-tool";

export const metadata: Metadata = {
  title: "Parte de horas",
  description:
    "Pega las horas de la semana y saca un parte limpio para el cliente o el jefe. Sin CRM, sin cuenta.",
};

export default function HorasPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Herramienta · sin CRM
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Las horas de la semana, en un papel.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Quien lleva la administración no quiere un fichaje. Quiere pegar lo que
        hizo, ver el total y mandarlo. Guardas el PDF y lo adjuntas tú.
      </p>
      <div className="mt-10">
        <TimesheetTool />
      </div>
    </div>
  );
}
