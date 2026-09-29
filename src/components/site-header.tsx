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

const links = [
  { href: "/presupuestos", label: "Presupuestos" },
  { href: "/versiones", label: "Versiones" },
  { href: "/cobros", label: "Cobros" },
  { href: "/horas", label: "Horas" },
  { href: "/gastos", label: "Gastos" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-xl tracking-tight">
          Luna Oficio
        </Link>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
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

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>

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
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
