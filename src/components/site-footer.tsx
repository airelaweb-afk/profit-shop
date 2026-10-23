import Link from "next/link";
import { SearchTicker } from "@/components/search-ticker";
import { SiteBrand } from "@/components/site-brand";
import { hasCloud } from "@/lib/supabase";

export function SiteFooter() {
  const cloud = hasCloud();
  return (
    <footer className="no-print mt-auto border-t-2 border-foreground pb-dock">
      <SearchTicker reverse tone="orange" />
      <div className="luna-wrap grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <SiteBrand />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Herramientas para PDF, imagen, audio y documentos de trabajo que
            funcionan en tu navegador. El archivo se procesa en tu aparato y no
            se sube a ningún servidor.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Herramientas</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link prefetch={false} href="/unir-pdf" className="hover:text-foreground">
                Unir PDF
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/comprimir-pdf" className="hover:text-foreground">
                Comprimir PDF
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/heic-a-jpg" className="hover:text-foreground">
                HEIC a JPG
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/quitar-fondo" className="hover:text-foreground">
                Quitar fondo
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/rellenar-pdf" className="hover:text-foreground">
                Rellenar PDF
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/editar-pdf" className="hover:text-foreground">
                Editar texto PDF
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/pdf" className="hover:text-foreground">
                Firmar PDF
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/jpg-a-webp" className="hover:text-foreground">
                JPG a WebP
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/audio-a-wav" className="hover:text-foreground">
                Audio a WAV
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/recortar-audio" className="hover:text-foreground">
                Recortar audio
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/presupuestos" className="hover:text-foreground">
                Presupuestos en PDF
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/webp-en-lote" className="hover:text-foreground">
                WebP en lote (Pro)
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/plugin-wordpress-webp" className="hover:text-foreground">
                Plugin WordPress WebP (Pro)
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Aprender</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link prefetch={false} href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/faq" className="hover:text-foreground">
                Preguntas frecuentes
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link prefetch={false} href="/aviso-legal" className="hover:text-foreground">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/privacidad" className="hover:text-foreground">
                Privacidad
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/cookies" className="hover:text-foreground">
                Cookies
              </Link>
            </li>
            <li>
              <Link prefetch={false} href="/condiciones" className="hover:text-foreground">
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
        <p className="luna-wrap py-4 text-xs text-background/70">
          Luna Oficio, de Airela Web. Herramientas para trabajar con archivos
          sin subirlos a un servidor. Marcas ajenas identificadas en{" "}
          <Link prefetch={false} href="/aviso-legal" className="text-accent underline underline-offset-2 hover:text-background">
            aviso legal
          </Link>
          .{" "}
          <Link prefetch={false} href="/admin" className="text-background/70 underline underline-offset-2 hover:text-accent">
            Panel
          </Link>
          {" · "}
          <Link prefetch={false} href="/precios" className="text-background/70 underline underline-offset-2 hover:text-accent">
            Pro
          </Link>
          {" · "}
          <Link prefetch={false} href="/comparar" className="text-background/70 underline underline-offset-2 hover:text-accent">
            Fichas
          </Link>
        </p>
      </div>
    </footer>
  );
}
