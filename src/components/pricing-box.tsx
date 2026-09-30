"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  hasRevolutPay,
  hasStripePay,
  PRO_PERIOD,
  PRO_PRICE,
  REVOLUT_PAYMENT_LINK,
  STRIPE_PAYMENT_LINK,
} from "@/lib/payments";
import { activatePro, deactivatePro } from "@/lib/pro";
import { LEGAL } from "@/lib/site";
import { usePro } from "@/lib/use-consent";

export function PricingBox() {
  const pro = usePro();
  const params = useSearchParams();
  const paidReturn = params.get("pago") === "ok";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const stripe = hasStripePay();
  const revolut = hasRevolutPay();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      activatePro(code);
      setNotice("Pro activo en este navegador. Sin anuncios aquí.");
      setCode("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo activar.");
    }
  }

  if (pro) {
    return (
      <div className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <p className="font-heading text-2xl">Pro está activo aquí.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Solo en este aparato. Si borras los datos del sitio, hay que
          introducir la clave otra vez.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-11"
          onClick={() => deactivatePro()}
        >
          Quitar Pro de este navegador
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {paidReturn ? (
        <p className="rounded-[2px] bg-accent px-4 py-3 text-sm text-accent-foreground">
          Si el pago ha salido bien, te llega la clave al correo. Pégala abajo
          para activar Pro en este navegador.
        </p>
      ) : null}

      <div className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <p className="font-heading text-2xl">Pagar Pro · {PRO_PRICE} / {PRO_PERIOD}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Elige tarjeta (Stripe) o Revolut. El archivo sigue en tu navegador:
          el pago es en su web, no aquí. Luego activas la clave abajo.
        </p>
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
          {stripe ? (
            <Button
              className="h-12"
              render={
                <a
                  href={STRIPE_PAYMENT_LINK}
                  target="_blank"
                  rel="noreferrer"
                />
              }
              nativeButton={false}
            >
              Pagar con tarjeta (Stripe)
            </Button>
          ) : null}
          {revolut ? (
            <Button
              variant="secondary"
              className="h-12"
              render={
                <a
                  href={REVOLUT_PAYMENT_LINK}
                  target="_blank"
                  rel="noreferrer"
                />
              }
              nativeButton={false}
            >
              Pagar con Revolut
            </Button>
          ) : null}
          {!stripe && !revolut ? (
            <Button
              className="h-12"
              render={
                <a
                  href={`mailto:${LEGAL.email}?subject=${encodeURIComponent("Luna Oficio Pro 29 €")}&body=${encodeURIComponent("Quiero Pro. Pago por Stripe o Revolut. Enviadme la clave para este navegador.")}`}
                />
              }
              nativeButton={false}
            >
              Escribir a {LEGAL.email}
            </Button>
          ) : null}
        </div>
        {!stripe || !revolut ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Para los botones directos, pega tu Payment Link de Stripe y tu
            revolut.me en <code>src/lib/payments.ts</code> o en las variables{" "}
            <code>NEXT_PUBLIC_STRIPE_PAYMENT_LINK</code> y{" "}
            <code>NEXT_PUBLIC_REVOLUT_PAYMENT_LINK</code>.
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15"
      >
        <p className="font-heading text-2xl">Activar clave</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Cuando hayas pagado, te enviamos la clave. Vive en este navegador,
          como la cuenta.
        </p>
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="pro-code">Clave</Label>
          <Input
            id="pro-code"
            className="h-12"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
            required
          />
        </div>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
        {notice ? (
          <p className="mt-3 text-sm text-muted-foreground">{notice}</p>
        ) : null}
        <Button type="submit" className="mt-4 h-12 w-full sm:w-auto">
          Activar en este navegador
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          ¿Dudas? <Link href="/contacto/">Contacto</Link>.
        </p>
      </form>
    </div>
  );
}
