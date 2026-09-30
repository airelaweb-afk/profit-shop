"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchTicker } from "@/components/search-ticker";
import { SiteBrand } from "@/components/site-brand";
import { logoutAccount } from "@/lib/auth";
import { allNavLinks } from "@/lib/nav";
import { useSession } from "@/lib/use-session";
import { MoreMenu } from "@/components/more-menu";

function AccountActions() {
  const session = useSession();
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-11 px-3 text-background hover:bg-background/10 hover:text-accent xl:h-9"
          render={<Link href="/entrar/" />}
          nativeButton={false}
        >
          Entrar
        </Button>
        <Button
          size="sm"
          className="hidden h-9 sm:inline-flex"
          render={<Link href="/entrar/?tab=crear" />}
          nativeButton={false}
        >
          Crear cuenta
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/cuenta/"
        className="hidden max-w-[10rem] truncate text-sm text-background/70 hover:text-accent sm:inline"
      >
        {session.name || "Mi cuenta"}
      </Link>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-11 px-3 text-background hover:bg-background/10 hover:text-accent xl:h-9"
        onClick={() => logoutAccount()}
      >
        Salir
      </Button>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 bg-foreground text-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <SiteBrand compact tone="ink" />

        <nav className="hidden items-center gap-4 text-sm 2xl:flex">
          {allNavLinks.map((link) => (
            <Link key={link.href} href={link.href} className="ink-link">
              {link.label}
            </Link>
          ))}
          <MoreMenu />
        </nav>

        <nav className="hidden items-center gap-3 text-sm xl:flex 2xl:hidden">
          <Link href="/herramientas-pdf" className="ink-link">
            PDF
          </Link>
          <Link href="/herramientas-imagen" className="ink-link">
            Imagen
          </Link>
          <Link href="/presupuestos" className="ink-link">
            Documentos
          </Link>
          <MoreMenu />
        </nav>

        <AccountActions />
      </div>
      <SearchTicker />
    </header>
  );
}
