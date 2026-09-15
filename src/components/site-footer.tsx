import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl">Luna Atelier</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Tienda de descargas digitales para quien quiere vender servicios o
            ordenar su trabajo. Sin inventario. Sin paquetería.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Tienda</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/tienda" className="hover:text-foreground">
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                href="/producto/bundle-emprendedor"
                className="hover:text-foreground"
              >
                Bundle Emprendedor
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="hover:text-foreground">
                Carrito
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">El modelo</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/como-vender" className="hover:text-foreground">
                Cómo ganar dinero con esto
              </Link>
            </li>
            <li>Pago de demostración, sin tarjeta real.</li>
            <li>Los archivos se descargan en el navegador.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Luna Atelier es una tienda de ejemplo lista para publicar. Conecta un
          pago real cuando quieras cobrar de verdad.
        </p>
      </div>
    </footer>
  );
}
