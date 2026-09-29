"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { logoutAccount } from "@/lib/auth";
import { useSession } from "@/lib/use-session";

const links = [
  { href: "/presupuestos", label: "Presupuestos" },
  { href: "/versiones", label: "Versiones" },
  { href: "/cobros", label: "Cobros" },
  { href: "/horas", label: "Horas" },
  { href: "/gastos", label: "Gastos" },
  { href: "/herramientas-pdf", label: "PDF" },
];

function AccountActions({ onNavigate }: { onNavigate?: () => void }) {
  const session = useSession();
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-9"
          render={<Link href="/entrar/" onClick={onNavigate} />}
          nativeButton={false}
        >
          Entrar
        </Button>
        <Button
          size="sm"
          className="h-9"
          render={
            <Link href="/entrar/?tab=crear" onClick={onNavigate} />
          }
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
        onClick={() => {
          logoutAccount();
          onNavigate?.();
        }}
      >
        Salir
      </Button>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl tracking-tight">
          Luna Oficio
        </Link>

        <nav className="hidden items-center gap-4 text-sm xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <AccountActions />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="font-heading text-xl">Menú</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 text-base hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/como-funciona"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-base hover:bg-muted"
              >
                Cómo funciona
              </Link>
              <div className="mt-3 sm:hidden">
                <AccountActions onNavigate={() => setOpen(false)} />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
