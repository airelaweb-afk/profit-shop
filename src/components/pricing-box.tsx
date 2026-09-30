"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileIsPro, refreshProfile } from "@/lib/cloud";
import {
  hasRevolutPay,
  hasStripePay,
  PRO_PERIOD,
  PRO_PRICE,
  REVOLUT_PAYMENT_LINK,
  stripeCheckoutUrl,
} from "@/lib/payments";
import { activatePro, deactivatePro } from "@/lib/pro";
import { LEGAL } from "@/lib/site";
import { hasCloud } from "@/lib/supabase";
import { formatIsoEs } from "@/lib/use-admin";
import { usePro, useProfile } from "@/lib/use-consent";
import { useSession } from "@/lib/use-session";

export function PricingBox() {
  const pro = usePro();
  const profile = useProfile();
  const session = useSession();
  const cloud = hasCloud();
  const params = useSearchParams();
  const paidReturn = params.get("pago") === "ok";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tries, setTries] = useState(0);
  const stripe = hasStripePay();
  const revolut = hasRevolutPay();
  const cloudPro = profileIsPro(profile);
  const MAX_TRIES = 8;
  const waitingForWebhook = cloud && paidReturn && Boolean(session) && !cloudPro;
  const checking = waitingForWebhook && tries < MAX_TRIES;

  // Al volver de Stripe con cuenta, el webhook ya habrá marcado el Pro: refrescamos unas veces.
  useEffect(() => {
    if (!waitingForWebhook) return;
    const timer = window.setInterval(() => {
      void refreshProfile();
      setTries((value) => {
        if (value + 1 >= MAX_TRIES) window.clearInterval(timer);
        return value + 1;
      });
    }, 2500);
    return () => window.clearInterval(timer);
  }, [waitingForWebhook]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await activatePro(code);
      setNotice("Pro activo en este navegador. Sin anuncios aquí.");
      setCode("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo activar.");
    }
  }

  if (pro) {
    return (
      <div className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <p className="font-heading text-2xl">
          {cloudPro ? "Pro está activo en tu cuenta." : "Pro está activo aquí."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {cloudPro && profile?.pro_until
            ? `Hasta el ${formatIsoEs(profile.pro_until)}, en cualquier aparato donde entres con ${profile.email}.`
            : "Solo en este aparato. Si borras los datos del sitio, hay que introducir la clave otra vez."}
        </p>
        {cloudPro ? (
          <Button
            variant="outline"
            className="mt-4 h-11"
            render={<Link href="/cuenta/" />}
            nativeButton={false}
          >
            Ver mi cuenta
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-11"
            onClick={() => deactivatePro()}
          >
            Quitar Pro de este navegador
          </Button>
        )}
      </div>
    );
  }

  const stripeHref = stripeCheckoutUrl(
    cloud && session ? { id: session.accountId, email: session.email } : null,
  );

  return (
    <div className="grid gap-4">
      {paidReturn ? (
        <p className="rounded-[2px] bg-accent px-4 py-3 text-sm text-accent-foreground">
          {cloud && session
            ? checking
              ? "Pago recibido. Activando Pro en tu cuenta… (unos segundos)."
              : "Si el pago ha salido bien, Pro se activa solo en tu cuenta. Si en unos minutos no aparece, escríbenos."
            : "Si el pago ha salido bien, te llega la clave al correo. Pégala abajo para activar Pro en este navegador."}
        </p>
      ) : null}

      <div className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <p className="font-heading text-2xl">Pagar Pro · {PRO_PRICE} / {PRO_PERIOD}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Elige tarjeta (Stripe) o Revolut. El archivo sigue en tu navegador:
          el pago es en su web, no aquí.
          {cloud
            ? session
              ? ` Pagas con ${session.email} y Pro se activa solo en tu cuenta.`
              : " Entra antes de pagar para que Pro se active solo en tu cuenta."
            : " Luego activas la clave abajo."}
        </p>
        {cloud && !session ? (
          <div className="mt-4 grid gap-2 sm:flex">
            <Button
              variant="outline"
              className="h-11"
              render={<Link href="/entrar/?next=%2Fprecios%2F" />}
              nativeButton={false}
            >
              Entrar
            </Button>
            <Button
              variant="outline"
              className="h-11"
              render={<Link href="/entrar/?tab=crear&next=%2Fprecios%2F" />}
              nativeButton={false}
            >
              Crear cuenta
            </Button>
          </div>
        ) : null}
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
          {stripe ? (
            <Button
              className="h-12"
              render={<a href={stripeHref} target="_blank" rel="noreferrer" />}
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
        {cloud && revolut ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Con Revolut el alta la hacemos a mano en cuanto vemos el pago: pon tu correo en el
            concepto.
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15"
      >
        <p className="font-heading text-2xl">
          {cloud ? "¿Tienes una clave?" : "Activar clave"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {cloud
            ? "Si te dimos una clave Pro (regalo, pago por Revolut o transferencia), pégala aquí. Vale en este navegador."
            : "Cuando hayas pagado, te enviamos la clave. Vive en este navegador, como la cuenta."}
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
