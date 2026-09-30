import Link from "next/link";
import { SearchTicker } from "@/components/search-ticker";
import { SiteBrand } from "@/components/site-brand";
import { competitors } from "@/lib/comparisons";
import { hasCloud } from "@/lib/supabase";

export function SiteFooter() {
  const cloud = hasCloud();
  return (
    <footer className="no-print mt-auto border-t-2 border-foreground pb-dock">
      <SearchTicker reverse tone="orange" />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <SiteBrand />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Herramientas para PDF, imágenes y documentos de trabajo que
            funcionan en tu navegador. El archivo se procesa en tu aparato y no
            se sube a ningún servidor.
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
              <Link href="/rellenar-pdf" className="hover:text-foreground">
                Rellenar PDF
              </Link>
            </li>
            <li>
              <Link href="/pdf" className="hover:text-foreground">
                Firmar PDF
              </Link>
            </li>
            <li>
              <Link href="/jpg-a-webp" className="hover:text-foreground">
                JPG a WebP
              </Link>
            </li>
            <li>
              <Link href="/presupuestos" className="hover:text-foreground">
                Presupuestos en PDF
              </Link>
            </li>
            <li>
              <Link href="/webp-en-lote" className="hover:text-foreground">
                WebP en lote (Pro)
              </Link>
            </li>
            <li>
              <Link href="/plugin-wordpress-webp" className="hover:text-foreground">
                Plugin WordPress WebP (Pro)
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
            <li>
              {cloud
                ? "Los archivos se procesan en tu navegador; solo tu cuenta se guarda en la nube."
                : "La cuenta y los archivos se quedan en este navegador."}
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-foreground text-background">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-background/70 sm:px-6">
          Luna Oficio, de Airela Web. Herramientas para trabajar con archivos
          sin subirlos a un servidor. Marcas ajenas identificadas en{" "}
          <Link href="/aviso-legal" className="text-accent underline-offset-2 hover:underline">
            aviso legal
          </Link>
          .{" "}
          <Link href="/admin" className="text-background/50 underline-offset-2 hover:text-accent hover:underline">
            Panel
          </Link>
        </p>
      </div>
    </footer>
  );
}
