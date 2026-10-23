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
  hasStripeMonthlyPay,
  hasStripePay,
  PRO_MONTHLY,
  PRO_YEARLY,
  REVOLUT_PAYMENT_LINK,
  stripeCheckoutUrl,
} from "@/lib/payments";
import { activatePro, deactivatePro } from "@/lib/pro";
import { LEGAL } from "@/lib/site";
import { hasCloud } from "@/lib/supabase";
import { formatIsoEs } from "@/lib/use-admin";
import { usePro, useProfile } from "@/lib/use-consent";
import { useSession } from "@/lib/use-session";

export function PricingBox({ locale = "es" }: { locale?: "es" | "en" }) {
  const en = locale === "en";
  const t = (es: string, english: string) => (en ? english : es);
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

  // Al volver de Stripe gratis, el webhook ya habrá marcado el Pro: refrescamos unas veces.
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
      await activatePro(code, locale);
      setNotice(t("Pro activo en este navegador. Sin límites.", "Pro is active in this browser. No limits."));
      setCode("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("No se pudo activar.", "Could not activate."));
    }
  }

  if (pro) {
    return (
      <div className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <p className="font-heading text-2xl">
          {cloudPro
            ? t("Pro está activo en tu cuenta.", "Pro is active on your account.")
            : t("Pro está activo aquí.", "Pro is active here.")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {cloudPro && profile?.pro_until
            ? en
              ? `Until ${new Date(profile.pro_until).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}, on any device where you sign in as ${profile.email}.`
              : `Hasta el ${formatIsoEs(profile.pro_until)}, en cualquier aparato donde entres con ${profile.email}.`
            : t(
                "Solo en este aparato. Si borras los datos del sitio, hay que introducir la clave otra vez.",
                "Only on this device. If you clear the site data, you have to enter the key again.",
              )}
        </p>
        {cloudPro ? (
          <Button
            variant="outline"
            className="mt-4 h-11"
            render={<Link href="/cuenta/" />}
            nativeButton={false}
          >
            {t("Ver mi cuenta", "My account")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-11"
            onClick={() => deactivatePro()}
          >
            {t("Quitar Pro de este navegador", "Remove Pro from this browser")}
          </Button>
        )}
      </div>
    );
  }

  const account = cloud && session ? { id: session.accountId, email: session.email } : null;
  const stripeYear = stripeCheckoutUrl(account, "year");
  const stripeMonth = stripeCheckoutUrl(account, "month");
  const monthly = hasStripeMonthlyPay();

  return (
    <div className="grid gap-4">
      {paidReturn ? (
        <p className="rounded-[2px] bg-accent px-4 py-3 text-sm text-accent-foreground">
          {cloud && session
            ? checking
              ? t(
                  "Pago recibido. Activando Pro en tu cuenta… (unos segundos).",
                  "Payment received. Turning Pro on for your account… (a few seconds).",
                )
              : t(
                  "Si el pago ha salido bien, Pro se activa solo en tu cuenta. Si en unos minutos no aparece, escríbenos.",
                  "If the payment went through, Pro turns on by itself on your account. If it is still missing after a few minutes, email us.",
                )
            : t(
                "Si el pago ha salido bien, te llega la clave al correo. Pégala abajo para activar Pro en este navegador.",
                "If the payment went through, the key arrives by email. Paste it below to activate Pro in this browser.",
              )}
        </p>
      ) : null}

      <div className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <p className="font-heading text-2xl">{t("Pagar Pro", "Pay for Pro")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {revolut
            ? t("Tarjeta (Stripe) o Revolut.", "Card (Stripe) or Revolut.")
            : t("Con tarjeta, en Stripe.", "By card, on Stripe.")}{" "}
          {t(
            "El archivo sigue en tu navegador: el pago es en su web, no aquí.",
            "The file stays in your browser: payment happens on their site, not here.",
          )}
          {cloud
            ? session
              ? en
                ? ` You pay as ${session.email} and Pro turns on by itself on your account.`
                : ` Pagas con ${session.email} y Pro se activa solo en tu cuenta.`
              : t(
                  " Entra antes de pagar para que Pro se active solo en tu cuenta.",
                  " Sign in before you pay so Pro turns on by itself on your account.",
                )
            : t(" Luego activas la clave abajo.", " Then activate the key below.")}
        </p>
        {cloud && !session ? (
          <div className="mt-4 grid gap-2 sm:flex">
            <Button
              variant="outline"
              className="h-11"
              render={<Link href={en ? "/entrar/?next=%2Fen%2Fpricing%2F" : "/entrar/?next=%2Fprecios%2F"} />}
              nativeButton={false}
            >
              {t("Entrar", "Sign in")}
            </Button>
            <Button
              variant="outline"
              className="h-11"
              render={<Link href={en ? "/entrar/?tab=crear&next=%2Fen%2Fpricing%2F" : "/entrar/?tab=crear&next=%2Fprecios%2F"} />}
              nativeButton={false}
            >
              {t("Crear cuenta", "Create account")}
            </Button>
          </div>
        ) : null}
        <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
          {stripe ? (
            <Button
              className="h-12"
              render={<a href={stripeYear} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              {t("Anual", "Yearly")} · {PRO_YEARLY}
            </Button>
          ) : null}
          {monthly ? (
            <Button
              variant="outline"
              className="h-12"
              render={<a href={stripeMonth} target="_blank" rel="noreferrer" />}
              nativeButton={false}
            >
              {t("Mensual", "Monthly")} · {PRO_MONTHLY}
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
              {t("Pagar con Revolut", "Pay with Revolut")}
            </Button>
          ) : null}
          {!stripe && !revolut ? (
            <Button
              className="h-12"
              render={
                <a
                  href={`mailto:${LEGAL.email}?subject=${encodeURIComponent("Luna Oficio Pro")}&body=${encodeURIComponent(en ? "I want Pro (7 €/month or 40 €/year). Payment by Stripe or Revolut." : "Quiero Pro (7 €/mes o 40 €/año). Pago por Stripe o Revolut.")}`}
                />
              }
              nativeButton={false}
            >
              {t("Escribir a", "Email")} {LEGAL.email}
            </Button>
          ) : null}
        </div>
        {!stripe ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {en
              ? "For the buttons, paste the Payment Links (yearly and monthly) and your revolut.me into "
              : "Para los botones, pega los Payment Link (anual y mensual) y tu revolut.me en "}
            <code>src/lib/payments.ts</code>
            {en ? " or in Hostinger: " : " o en Hostinger: "}
            <code>NEXT_PUBLIC_STRIPE_PAYMENT_LINK</code>,{" "}
            <code>NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY</code>,{" "}
            <code>NEXT_PUBLIC_REVOLUT_PAYMENT_LINK</code>. En Stripe, metadata{" "}
            <code>months=12</code> (anual) y <code>months=1</code> (mensual).
          </p>
        ) : null}
        {cloud && revolut ? (
          <p className="mt-3 text-xs text-muted-foreground">
            {t(
              "Con Revolut el alta la hacemos a mano en cuanto vemos el pago: pon tu correo en el concepto.",
              "With Revolut we switch Pro on by hand when we see the payment: put your email in the reference.",
            )}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={(event) => void onSubmit(event)}
        className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15"
      >
        <p className="font-heading text-2xl">
          {cloud ? t("¿Tienes una clave?", "Have a key?") : t("Activar clave", "Activate a key")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {cloud
            ? t(
                "Si te dimos una clave Pro (regalo, pago por Revolut o transferencia), pégala aquí. Vale en este navegador.",
                "If we gave you a Pro key (a gift, a Revolut payment or a transfer), paste it here. It works in this browser.",
              )
            : t(
                "Cuando hayas pagado, te enviamos la clave. Vive en este navegador, como la cuenta.",
                "After you pay, we email the key. It lives in this browser, like the account.",
              )}
        </p>
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="pro-code">{t("Clave", "Key")}</Label>
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
          {t("Activar en este navegador", "Activate in this browser")}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          {t("¿Dudas?", "Questions?")}{" "}
          <Link href={en ? "/en/contact/" : "/contacto/"}>{t("Contacto", "Contact")}</Link>.
        </p>
      </form>
    </div>
  );
}
