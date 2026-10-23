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
import { useLocale } from "@/lib/locale-context";
import {
  allNavLinks,
  cleanPath,
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
    label: "Documentos",
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

function SpanishDock() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const session = useSession();

  return (
    <div className="no-print xl:hidden">
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary bg-foreground text-background"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Accesos del teléfono"
      >
        <ul className="mx-auto grid h-[3.75rem] max-w-lg grid-cols-5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.match);
            return (
              <li key={item.href}>
                <Link prefetch={false}
                  href={item.href}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] ${
                    active ? "text-accent" : "text-background/60"
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
              className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[11px] text-background/60"
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
              <Link prefetch={false}
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <Link prefetch={false}
              href="/blog"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Blog
            </Link>
            <Link prefetch={false}
              href="/faq"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Preguntas frecuentes
            </Link>
            <Link prefetch={false}
              href="/como-funciona"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Cómo funciona
            </Link>
            <Link prefetch={false}
              href="/audio-a-wav"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Audio a WAV
            </Link>
            <Link prefetch={false}
              href="/cookies"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 text-base hover:bg-muted"
            >
              Cookies y privacidad
            </Link>
            {session ? (
              <div className="mt-3 grid gap-1">
                <Link prefetch={false}
                  href="/cuenta/"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base hover:bg-muted"
                >
                  Mi cuenta · {session.name || session.email}
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 justify-start"
                  onClick={() => {
                    logoutAccount();
                    setOpen(false);
                  }}
                >
                  Salir
                </Button>
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                <Button
                  className="h-12"
                  render={
                    <Link prefetch={false} href="/entrar/" onClick={() => setOpen(false)} />
                  }
                  nativeButton={false}
                >
                  Entrar
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  render={
                    <Link prefetch={false}
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
            <p className="mt-6 px-3 text-xs text-muted-foreground">
              <Link prefetch={false} href="/precios" onClick={() => setOpen(false)} className="hover:text-foreground">
                Pro
              </Link>
              {" · "}
              <Link prefetch={false} href="/comparar" onClick={() => setOpen(false)} className="hover:text-foreground">
                Fichas
              </Link>
            </p>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

const englishDock = [
  { href: "/en/", label: "Home", icon: House },
  { href: "/en/pdf-tools/", label: "PDF", icon: FileText },
  { href: "/en/image-tools/", label: "Photos", icon: FileImage },
  { href: "/en/quotes/", label: "Docs", icon: NotebookPen },
];

const englishSheet = [
  { href: "/en/remove-background/", label: "Remove background" },
  { href: "/en/merge-pdf/", label: "Merge PDF" },
  { href: "/en/compress-pdf/", label: "Compress PDF" },
  { href: "/en/sign-pdf/", label: "Sign PDF" },
  { href: "/en/heic-to-jpg/", label: "HEIC to JPG" },
  { href: "/en/compress-image/", label: "Compress image" },
  { href: "/en/audio-to-wav/", label: "Audio to WAV" },
  { href: "/en/quotes/", label: "Quotes" },
  { href: "/en/pricing/", label: "Pricing" },
  { href: "/en/faq/", label: "Questions" },
  { href: "/en/blog/", label: "Blog" },
  { href: "/en/compare/", label: "Comparisons" },
  { href: "/en/legal-notice/", label: "Legal notice" },
  { href: "/en/privacy/", label: "Privacy" },
  { href: "/en/cookies/", label: "Cookies" },
  { href: "/en/terms/", label: "Terms" },
];

function EnglishDock() {
  const pathname = cleanPath(usePathname() || "/");
  const [open, setOpen] = useState(false);
  const session = useSession();

  return (
    <div className="no-print xl:hidden">
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-primary bg-foreground text-background"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Mobile shortcuts"
      >
        <ul className="mx-auto grid h-[3.75rem] max-w-lg grid-cols-5">
          {englishDock.map((item) => {
            const Icon = item.icon;
            const target = cleanPath(item.href);
            const active = target === "/en" ? pathname === "/en" : pathname === target;
            return (
              <li key={item.href}>
                <Link
                  prefetch={false}
                  href={item.href}
                  className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] ${
                    active ? "text-accent" : "text-background/60"
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
              className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[11px] text-background/60"
              aria-label="More tools"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
              More
            </button>
          </li>
        </ul>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[min(20rem,92vw)]">
          <SheetHeader>
            <SheetTitle className="font-heading text-xl">Tools</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-3 pb-8">
            {englishSheet.map((link) => (
              <Link
                prefetch={false}
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            {session ? (
              <div className="mt-3 grid gap-1">
                <Link
                  prefetch={false}
                  href="/cuenta/"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base hover:bg-muted"
                >
                  My account · {session.name || session.email}
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 justify-start"
                  onClick={() => {
                    logoutAccount();
                    setOpen(false);
                  }}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                <Button
                  className="h-12"
                  render={<Link prefetch={false} href="/entrar/" onClick={() => setOpen(false)} />}
                  nativeButton={false}
                >
                  Sign in
                </Button>
              </div>
            )}
            <p className="mt-6 px-3 text-xs text-muted-foreground">
              <Link prefetch={false} href="/en/pricing/" onClick={() => setOpen(false)} className="hover:text-foreground">
                Pro
              </Link>
            </p>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function MobileDock() {
  const locale = useLocale();
  if (locale === "en") return <EnglishDock />;
  return <SpanishDock />;
}
