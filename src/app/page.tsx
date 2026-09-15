import Link from "next/link";
import { ArrowRight, Download, Package, Wallet } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts, getProduct } from "@/lib/products";
import { formatPrice } from "@/lib/money";
import { ProductCover } from "@/components/product-cover";

export default function HomePage() {
  const featured = getFeaturedProducts();
  const bundle = getProduct("bundle-emprendedor");

  return (
    <div>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div>
          <p className="text-sm tracking-wide text-primary uppercase">
            Tienda de descargas digitales
          </p>
          <h1 className="mt-3 font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Vende por internet sin inventario ni paquetería.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Luna Atelier es una tienda lista: planners, plantillas y kits que
            el cliente paga y descarga al momento. El mismo modelo con el que
            miles de personas facturan desde casa — Etsy, Gumroad, su propia
            web — sin comprar stock.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-11 px-5"
              render={<Link href="/tienda" />}
              nativeButton={false}
            >
              Entrar a la tienda
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-5"
              render={<Link href="/como-vender" />}
              nativeButton={false}
            >
              Cómo se gana dinero
            </Button>
          </div>
        </div>

        {bundle ? (
          <Link
            href={`/producto/${bundle.slug}`}
            className="relative block rounded-3xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
          >
            <ProductCover
              style={bundle.cover}
              title={bundle.shortName}
              className="max-h-[420px]"
            />
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  El atajo
                </p>
                <p className="font-heading text-2xl">{bundle.name}</p>
              </div>
              <p className="text-sm font-medium">{formatPrice(bundle.price)}</p>
            </div>
          </Link>
        ) : null}
      </section>

      <section className="border-y border-border/80 bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          {[
            {
              icon: Package,
              title: "Cero stock",
              text: "El producto es un archivo. Lo haces una vez y se vende mientras duermes.",
            },
            {
              icon: Download,
              title: "Entrega al instante",
              text: "El cliente paga y descarga. No hay correos de “¿dónde va el paquete?”.",
            },
            {
              icon: Wallet,
              title: "Margen alto",
              text: "Un planner a 12 USD. Un bundle a 39. Casi todo es ganancia neta.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-1 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl">Destacados</h2>
            <p className="mt-2 text-muted-foreground">
              Lo que un freelancer o un estudio pequeño compra el primer mes.
            </p>
          </div>
          <Button variant="link" render={<Link href="/tienda" />} nativeButton={false}>
            Ver todo
          </Button>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
