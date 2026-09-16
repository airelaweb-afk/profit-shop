import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-border/80">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl">Luna Oficio</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Herramientas admin para autónomos y empresas pequeñas. Un atasco
            cada vez. Sin CRM.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Usar</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/cobros" className="hover:text-foreground">
                Recordatorios de cobro
              </Link>
            </li>
            <li>
              <Link href="/presupuestos" className="hover:text-foreground">
                Tanda de presupuestos
              </Link>
            </li>
            <li>
              <Link href="/tienda" className="hover:text-foreground">
                Plantillas descargables
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Enfoque</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/como-funciona" className="hover:text-foreground">
                Cómo funciona
              </Link>
            </li>
            <li>Los datos de los presupuestos no salen de tu navegador.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Luna Oficio. Herramientas puntuales, no un sistema de gestión.
        </p>
      </div>
    </footer>
  );
}
