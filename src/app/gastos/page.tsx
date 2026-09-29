import type { Metadata } from "next";
import { AuthGate } from "@/components/auth-gate";
import { ExpenseTool } from "@/components/expense-tool";

export const metadata: Metadata = {
  title: "Relación de gastos",
  description:
    "Pega los tickets del mes y saca una lista con base e IVA para el gestor. Sin Excel.",
};

export default function GastosPage() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="no-print text-sm tracking-wide text-primary uppercase">
          Herramienta · con cuenta
        </p>
        <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          Los tickets del mes, listos para el gestor.
        </h1>
        <p className="no-print mt-3 max-w-2xl text-muted-foreground">
          Pegas fecha, tienda, lo que pagaste y el IVA. Sale la base, el IVA y
          el total. Guardas el PDF. No sustituye a la contabilidad: ordena el
          caos del cajón.
        </p>
        <div className="mt-10">
          <ExpenseTool />
        </div>
      </div>
    </AuthGate>
  );
}
