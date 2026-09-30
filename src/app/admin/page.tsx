import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/admin-panel";
import { hasCloud } from "@/lib/supabase";

const cloud = hasCloud();

export const metadata: Metadata = {
  title: "Panel de administración",
  description: "Panel privado de Luna Oficio.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Administración</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {cloud ? "Tu panel. Registros, socios y cobros." : "Tu panel. Socios, claves y este aparato."}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {cloud
          ? "Conectado a la base de datos: todas las cuentas, quién tiene Pro y hasta cuándo, los cobros de Stripe según entran y las altas manuales de Revolut o Bizum."
          : "Sin servidor: el panel vive en tu navegador. Aquí apuntas quién ha pagado, emites su clave Pro firmada y controlas las cuentas de este aparato."}
      </p>
      <AdminPanel />
    </div>
  );
}
