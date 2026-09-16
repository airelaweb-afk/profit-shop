"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/money";
import { createOrderId, saveOrder } from "@/lib/orders";

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return <p className="text-sm text-muted-foreground">Cargando…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
        <h1 className="font-heading text-3xl">No hay nada que cobrar</h1>
        <p className="mt-3 text-muted-foreground">
          Añade un producto antes de pasar por caja.
        </p>
        <Button
          className="mt-5 h-11 px-5"
          render={<Link href="/tienda" />}
          nativeButton={false}
        >
          Volver a la tienda
        </Button>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      setError("Escribe tu nombre para asociarlo al pedido.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Necesitamos un correo válido para la descarga.");
      return;
    }

    setSubmitting(true);
    const id = createOrderId();
    saveOrder({
      id,
      name: trimmedName,
      email: trimmedEmail,
      items: lines.map(({ product, quantity }) => ({
        slug: product.slug,
        name: product.name,
        quantity,
        price: product.price,
      })),
      total: subtotal,
      createdAt: new Date().toISOString(),
    });
    clear();
    router.push(`/pedido/?id=${encodeURIComponent(id)}`);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10"
      >
        <h1 className="font-heading text-3xl">Pagar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta caja es de demostración: no pide tarjeta ni cobra. En un
          lanzamiento real aquí iría Stripe, Mercado Pago o Lemon Squeezy.
        </p>

        <div className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10"
              placeholder="Ana López"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10"
              placeholder="ana@estudio.com"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="mt-6 h-11 w-full sm:w-auto sm:px-6"
          disabled={submitting}
        >
          {submitting
            ? "Preparando descarga…"
            : `Confirmar pedido · ${formatPrice(subtotal)}`}
        </Button>
      </form>

      <aside className="h-fit rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <h2 className="font-heading text-2xl">Tu pedido</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map(({ product, quantity }) => (
            <li key={product.slug} className="flex justify-between gap-3">
              <span>
                {product.shortName}
                {quantity > 1 ? ` ×${quantity}` : ""}
              </span>
              <span>{formatPrice(product.price * quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-border pt-4 font-medium">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
