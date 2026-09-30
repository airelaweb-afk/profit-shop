"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteBrand } from "@/components/site-brand";
import { logoutAccount } from "@/lib/auth";
import { allNavLinks } from "@/lib/nav";
import { useSession } from "@/lib/use-session";

function AccountActions() {
  const session = useSession();
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-11 px-3 xl:h-9"
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
      <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
        {session.name}
      </span>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-11 px-3 xl:h-9"
        onClick={() => logoutAccount()}
      >
        Salir
      </Button>
    </div>
  );
}

const extraLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/precios", label: "Precios" },
] as const;

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b-2 border-foreground/90 bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <SiteBrand compact />

        <nav className="hidden items-center gap-4 text-sm 2xl:flex">
          {allNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {extraLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden items-center gap-3 text-sm xl:flex 2xl:hidden">
          <Link href="/herramientas-pdf" className="text-muted-foreground hover:text-foreground">
            PDF
          </Link>
          <Link href="/herramientas-imagen" className="text-muted-foreground hover:text-foreground">
            Imagen
          </Link>
          <Link href="/presupuestos" className="text-muted-foreground hover:text-foreground">
            Oficio
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground">
            Blog
          </Link>
          <Link href="/precios" className="text-muted-foreground hover:text-foreground">
            Precios
          </Link>
        </nav>

        <AccountActions />
      </div>
    </header>
  );
}
