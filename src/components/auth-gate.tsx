"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/safe-next";
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
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-muted-foreground">
        Comprobando la sesión…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <p className="text-sm tracking-wide text-primary uppercase">Cuenta</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">
          Entra para usar las herramientas.
        </h1>
        <p className="mt-3 text-muted-foreground">
          Presupuestos, cobros, PDF e imágenes son para quien tiene cuenta.
          La creas aquí. Los datos (y tus PDF) se quedan en este navegador: no
          hay servidor nuestro.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            className="h-11 px-5"
            render={<Link href={`/entrar/?next=${encodeURIComponent(next)}`} />}
            nativeButton={false}
          >
            Iniciar sesión
          </Button>
          <Button
            variant="outline"
            className="h-11 px-5"
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
