"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/safe-next";
import { hasCloud } from "@/lib/supabase";
import { useSession } from "@/lib/use-session";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const ready = useHydrated();
  const next = safeNextPath(pathname || "/pdf/");

  if (!ready) {
    return (
      <div className="rounded-2xl bg-card px-4 py-8 text-sm text-muted-foreground ring-1 ring-foreground/10">
        Comprobando la sesión…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
        <p className="text-sm tracking-wide text-primary uppercase">Cuenta</p>
        <h2 className="mt-2 font-heading text-3xl tracking-tight">
          Entra para procesar el archivo.
        </h2>
        <p className="mt-3 text-muted-foreground">
          {hasCloud()
            ? "Gratis y vale en todos tus aparatos. Los PDF y las fotos no salen del navegador. El título y las guías de esta página se pueden leer sin cuenta."
            : "La creas aquí, en este teléfono o este ordenador. Los PDF y las fotos no salen del navegador. El título y las guías de esta página se pueden leer sin cuenta."}
        </p>
        <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap">
          <Button
            className="h-12 w-full sm:w-auto sm:px-5"
            render={<Link href={`/entrar/?next=${encodeURIComponent(next)}`} />}
            nativeButton={false}
          >
            Iniciar sesión
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full sm:w-auto sm:px-5"
            render={
              <Link
                href={`/entrar/?tab=crear&next=${encodeURIComponent(next)}`}
              />
            }
            nativeButton={false}
          >
            Crear cuenta
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
