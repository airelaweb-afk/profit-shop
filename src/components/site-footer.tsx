import Link from "next/link";
import { SearchTicker } from "@/components/search-ticker";
import { SiteBrand } from "@/components/site-brand";
import { competitors } from "@/lib/comparisons";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t-2 border-foreground pb-dock">
      <SearchTicker reverse tone="orange" />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <SiteBrand />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Unir PDF, comprimir imagen y el oficio del autónomo. En el
            navegador. Los datos se quedan en tu aparato.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Herramientas</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/unir-pdf" className="hover:text-foreground">
                Unir PDF
              </Link>
            </li>
            <li>
              <Link href="/comprimir-pdf" className="hover:text-foreground">
                Comprimir PDF
              </Link>
            </li>
            <li>
              <Link href="/heic-a-jpg" className="hover:text-foreground">
                HEIC a JPG
              </Link>
            </li>
            <li>
              <Link href="/pdf" className="hover:text-foreground">
                Firmar PDF
              </Link>
            </li>
            <li>
              <Link href="/presupuestos" className="hover:text-foreground">
                Presupuestos
              </Link>
            </li>
            <li>
              <Link href="/marca-de-agua-pdf" className="hover:text-foreground">
                Marca de agua (Pro)
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Aprender</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/comparar" className="hover:text-foreground">
                Comparativas
              </Link>
            </li>
            {competitors.slice(0, 3).map((item) => (
              <li key={item.slug}>
                <Link href={item.href} className="hover:text-foreground">
                  Frente a {item.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faq" className="hover:text-foreground">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link href="/precios" className="hover:text-foreground">
                Precios
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/aviso-legal" className="hover:text-foreground">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-foreground">
                Privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-foreground">
                Cookies
              </Link>
            </li>
            <li>
              <Link href="/condiciones" className="hover:text-foreground">
                Condiciones
              </Link>
            </li>
            <li>La cuenta y los archivos se quedan en este navegador.</li>
          </ul>
        </div>
      </div>
      <div className="bg-foreground text-background">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-background/70 sm:px-6">
          Luna Oficio. Herramientas puntuales, no un sistema de gestión. Airela
          Web. Marcas ajenas identificadas en{" "}
          <Link href="/aviso-legal" className="text-accent underline-offset-2 hover:underline">
            aviso legal
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
