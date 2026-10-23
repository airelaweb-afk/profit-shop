"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchTicker } from "@/components/search-ticker";
import { SiteBrand } from "@/components/site-brand";
import { logoutAccount } from "@/lib/auth";
import { allNavLinks } from "@/lib/nav";
import { useSession } from "@/lib/use-session";
import { LanguageSwitch } from "@/components/language-switch";
import { MoreMenu } from "@/components/more-menu";
import { useLocale } from "@/lib/locale-context";

const englishNav = [
  { href: "/en/merge-pdf/", label: "Merge PDF" },
  { href: "/en/compress-pdf/", label: "Compress PDF" },
  { href: "/en/heic-to-jpg/", label: "HEIC to JPG" },
  { href: "/en/compress-image/", label: "Compress image" },
];

function AccountActions() {
  const session = useSession();
  const english = useLocale() === "en";
  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-11 px-3 text-background hover:bg-background/10 hover:text-accent xl:h-9"
          render={<Link prefetch={false} href="/entrar/" />}
          nativeButton={false}
        >
          {english ? "Sign in" : "Entrar"}
        </Button>
        <Button
          size="sm"
          className="hidden h-9 sm:inline-flex"
          render={<Link prefetch={false} href="/entrar/?tab=crear" />}
          nativeButton={false}
        >
          {english ? "Create account" : "Crear cuenta"}
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Link
        prefetch={false}
        href="/cuenta/"
        className="hidden max-w-[10rem] truncate text-sm text-background/70 hover:text-accent sm:inline"
      >
        {session.name || (english ? "My account" : "Mi cuenta")}
      </Link>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-11 px-3 text-background hover:bg-background/10 hover:text-accent xl:h-9"
        onClick={() => logoutAccount()}
      >
        {english ? "Log out" : "Salir"}
      </Button>
    </div>
  );
}

function EnglishHeader() {
  return (
    <header className="no-print sticky top-0 z-40 bg-foreground text-background">
      <div className="luna-wrap flex h-14 items-center justify-between gap-3 sm:h-16">
        <SiteBrand compact tone="ink" href="/en/" />
        <nav className="hidden items-center gap-4 text-sm xl:flex">
          {englishNav.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="ink-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-4 xl:flex">
          <Link
            prefetch={false}
            href="/en/remove-background/"
            className="new-glow rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            Remove background
          </Link>
          <LanguageSwitch className="ink-link text-sm" />
          <AccountActions />
        </div>
        <div className="ml-auto flex items-center gap-2 xl:hidden">
          <LanguageSwitch className="ink-link text-sm" />
          <AccountActions />
        </div>
      </div>
    </header>
  );
}

function SpanishHeader() {
  return (
    <header className="no-print sticky top-0 z-40 bg-foreground text-background">
      <div className="luna-wrap flex h-14 items-center justify-between gap-3 sm:h-16">
        <SiteBrand compact tone="ink" />

        <nav className="hidden items-center gap-4 text-sm 2xl:flex">
          {allNavLinks.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="ink-link">
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="hidden items-center gap-3 text-sm xl:flex 2xl:hidden">
          <Link prefetch={false} href="/herramientas-pdf" className="ink-link">
            PDF
          </Link>
          <Link prefetch={false} href="/herramientas-imagen" className="ink-link">
            Imagen
          </Link>
          <Link prefetch={false} href="/audio-a-wav" className="ink-link">
            Audio
          </Link>
          <Link prefetch={false} href="/presupuestos" className="ink-link">
            Documentos
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-4 xl:flex">
          <LanguageSwitch className="ink-link text-sm" />
          <Link
            prefetch={false}
            href="/quitar-fondo/"
            className="new-glow rounded-full bg-accent px-3 py-1 text-sm font-semibold text-accent-foreground transition hover:bg-primary hover:text-primary-foreground"
          >
            Quitar fondo
          </Link>
          <MoreMenu />
          <AccountActions />
        </div>
        <div className="ml-auto flex items-center gap-2 xl:hidden">
          <LanguageSwitch className="ink-link text-sm" />
          <AccountActions />
        </div>
      </div>
      <SearchTicker />
    </header>
  );
}

export function SiteHeader() {
  const locale = useLocale();
  return locale === "en" ? <EnglishHeader /> : <SpanishHeader />;
}
