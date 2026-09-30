"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { FileImage, FileText, House, Menu, NotebookPen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { logoutAccount } from "@/lib/auth";
import {
  allNavLinks,
  isImagePath,
  isOfficePath,
  isPdfPath,
} from "@/lib/nav";
import { useSession } from "@/lib/use-session";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/", label: "Inicio", icon: House, match: "home" as const },
  {
    href: "/herramientas-pdf",
    label: "PDF",
    icon: FileText,
    match: "pdf" as const,
  },
  {
    href: "/herramientas-imagen",
    label: "Fotos",
    icon: FileImage,
    match: "image" as const,
  },
  {
    href: "/presupuestos",
    label: "Oficio",
    icon: NotebookPen,
    match: "office" as const,
  },
];

function isActive(
  pathname: string,
  match: (typeof items)[number]["match"],
) {
  if (match === "home") return pathname === "/" || pathname === "";
  if (match === "pdf") return isPdfPath(pathname);
  if (match === "image") return isImagePath(pathname);
  return isOfficePath(pathname);
}

export function MobileDock() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const session = useSession();

  return (
    <div className="no-print xl:hidden">
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Accesos del teléfono"
      >
        <ul className="mx-auto grid h-[3.75rem] max-w-lg grid-cols-5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.match);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[11px] text-muted-foreground"
              aria-label="Más herramientas"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
              Más
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[min(20rem,92vw)]">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl">Herramientas</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 pb-8">
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Blog
            </Link>
            <Link
              href="/precios"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Precios
            </Link>
            <Link
              href="/faq"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Preguntas frecuentes
            </Link>
            <Link
              href="/como-funciona"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Cómo funciona
            </Link>
            <Link
              href="/cookies"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Cookies y privacidad
            </Link>
            {session ? (
              <Button
                type="button"
                variant="ghost"
                className="mt-3 h-12 justify-start"
                onClick={() => {
                  logoutAccount();
                  setOpen(false);
                }}
              >
                Salir
              </Button>
            ) : (
              <div className="mt-3 grid gap-2">
                <Button
                  className="h-12"
                  render={
                    <Link href="/entrar/" onClick={() => setOpen(false)} />
                  }
                  nativeButton={false}
                >
                  Entrar
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  render={
                    <Link
                      href="/entrar/?tab=crear"
                      onClick={() => setOpen(false)}
                    />
                  }
                  nativeButton={false}
                >
                  Crear cuenta
                </Button>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
