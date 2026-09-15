"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCover } from "@/components/product-cover";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";

export function CartPage() {
  const { lines, subtotal, setQuantity, remove, ready } = useCart();

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">Cargando el carrito…</p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
        <p className="font-heading text-3xl">Todavía no hay archivos</p>
        <p className="mt-3 max-w-md text-muted-foreground">
          No hay archivos todavía. El Bundle Emprendedor es el camino más corto
          si estás armando un negocio de servicios.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-11 px-5"
            render={<Link href="/tienda" />}
            nativeButton={false}
          >
            Ir a la tienda
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-5"
            render={<Link href="/producto/bundle-emprendedor" />}
            nativeButton={false}
          >
            Ver el bundle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="flex flex-col gap-5">
        {lines.map(({ product, quantity }) => (
          <li
            key={product.slug}
            className="flex gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="w-24 shrink-0 sm:w-28">
              <ProductCover style={product.cover} title="" className="rounded-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/producto/${product.slug}`}
                className="font-heading text-xl leading-snug hover:underline"
              >
                {product.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {product.format} · entrega inmediata
              </p>
              <p className="mt-2 text-sm font-medium">
                {formatPrice(product.price)}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Quitar uno"
                  onClick={() => setQuantity(product.slug, quantity - 1)}
                >
                  <Minus />
                </Button>
                <span className="w-6 text-center text-sm">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Añadir uno"
                  onClick={() => setQuantity(product.slug, quantity + 1)}
                >
                  <Plus />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => remove(product.slug)}
                >
                  <Trash2 />
                  Quitar
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="font-heading text-2xl">Resumen</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Envío</span>
          <span>Gratis — es digital</span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 font-medium">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <Button
          size="lg"
          className="mt-5 h-11 w-full"
          render={<Link href="/checkout" />}
          nativeButton={false}
        >
          Pagar
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          El checkout de esta demo no cobra una tarjeta real. El archivo se
          descarga igual, para que pruebes el flujo completo.
        </p>
      </aside>
    </div>
  );
}
