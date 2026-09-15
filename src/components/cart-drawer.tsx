"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { ProductCover } from "@/components/product-cover";

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lines, count, subtotal, setQuantity, remove, ready } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrito</SheetTitle>
          <SheetDescription>
            {ready
              ? count === 0
                ? "Todavía no hay descargas."
                : `${count} ${count === 1 ? "archivo" : "archivos"} listos para pagar.`
              : "Cargando…"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
          {!ready ? (
            <p className="text-sm text-muted-foreground">Cargando el carrito…</p>
          ) : lines.length === 0 ? (
            <div className="rounded-xl bg-muted/60 p-5">
              <p className="font-heading text-lg">El carrito está vacío</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Empieza por el Bundle Emprendedor o el planner: son los que más
                se llevan.
              </p>
              <Button
                className="mt-4 h-10 px-4"
                render={<Link href="/tienda" />}
                nativeButton={false}
                onClick={() => onOpenChange(false)}
              >
                Ver la tienda
              </Button>
            </div>
          ) : (
            lines.map(({ product, quantity }) => (
              <div key={product.slug} className="flex gap-3">
                <div className="w-16 shrink-0">
                  <ProductCover
                    style={product.cover}
                    title=""
                    className="rounded-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(product.price)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label="Quitar uno"
                      onClick={() => setQuantity(product.slug, quantity - 1)}
                    >
                      <Minus />
                    </Button>
                    <span className="w-5 text-center text-sm">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label="Añadir uno"
                      onClick={() => setQuantity(product.slug, quantity + 1)}
                    >
                      <Plus />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Eliminar"
                      className="ml-auto"
                      onClick={() => remove(product.slug)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lines.length > 0 ? (
          <SheetFooter>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Productos digitales: el archivo llega al instante, sin envío.
            </p>
            <Button
              size="lg"
              className="h-11 w-full"
              render={<Link href="/checkout" />}
              nativeButton={false}
              onClick={() => onOpenChange(false)}
            >
              Ir a pagar
            </Button>
            <Button
              variant="ghost"
              render={<Link href="/carrito" />}
              nativeButton={false}
              onClick={() => onOpenChange(false)}
            >
              Ver carrito
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
