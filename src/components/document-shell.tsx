import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { MobileDock } from "@/components/mobile-dock";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LocaleProvider } from "@/lib/locale-context";
import type { Locale } from "@/lib/locale";

export function DocumentShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleProvider locale={locale}>
      <JsonLd locale={locale} />
      <Providers>
        <SiteHeader />
        <main className="flex-1 pb-dock">{children}</main>
        <SiteFooter locale={locale} />
        <MobileDock />
      </Providers>
    </LocaleProvider>
  );
}
