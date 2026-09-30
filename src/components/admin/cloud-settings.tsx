"use client";

import { useState } from "react";
import { ConsentControls } from "@/components/consent-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { downloadText, exportBackup, getSigningKey, importBackup } from "@/lib/admin";
import { logoutAccount } from "@/lib/auth";
import { cloudUpdatePassword } from "@/lib/cloud";
import { hasRevolutPay, hasStripePay, REVOLUT_PAYMENT_LINK, STRIPE_PAYMENT_LINK } from "@/lib/payments";
import { ADSENSE_CLIENT, LEGAL, SITE_URL } from "@/lib/site";
import { SUPABASE_URL } from "@/lib/supabase";
import { useSession } from "@/lib/use-session";

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs break-all" : "break-all"}>{value}</dd>
    </div>
  );
}

export function CloudSettings() {
  const session = useSession();
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const signing = Boolean(getSigningKey());
  const webhook = `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/stripe-webhook`;

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { members } = importBackup(await file.text());
      setMsg(`Copia restaurada. ${members} socios locales nuevos.`);
    } catch (caught) {
      setMsg(caught instanceof Error ? caught.message : "No se pudo importar.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Conexiones</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Supabase" value={SUPABASE_URL} mono />
          <Row label="Cuenta de administración" value={session?.email ?? "—"} />
          <Row
            label="Stripe Payment Link"
            value={hasStripePay() ? STRIPE_PAYMENT_LINK : "Sin configurar (NEXT_PUBLIC_STRIPE_PAYMENT_LINK)"}
            mono
          />
          <Row
            label="Revolut"
            value={hasRevolutPay() ? REVOLUT_PAYMENT_LINK : "Sin configurar (NEXT_PUBLIC_REVOLUT_PAYMENT_LINK)"}
            mono
          />
          <Row label="AdSense" value={ADSENSE_CLIENT || "Sin ID: anuncio de casa"} />
          <Row label="Correo de contacto" value={LEGAL.email} />
          <div className="sm:col-span-2">
            <Row label="Endpoint del webhook (pégalo en Stripe → Developers → Webhooks)" value={webhook} mono />
          </div>
          <div className="sm:col-span-2">
            <Row label="URL de éxito del Payment Link" value={`${SITE_URL}/precios/?pago=ok`} mono />
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Eventos que debe enviar el webhook: <code>checkout.session.completed</code>,{" "}
          <code>checkout.session.async_payment_succeeded</code> y <code>charge.refunded</code>.
          Los secretos (<code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>) van en
          Supabase → Edge Functions → Secrets, nunca en la web.
        </p>
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Contraseña de administración</h2>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await cloudUpdatePassword(next);
              setNext("");
              setMsg("Contraseña cambiada.");
            } catch (caught) {
              setMsg(caught instanceof Error ? caught.message : "Error.");
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="pw-next">Nueva (mín. 8)</Label>
            <Input id="pw-next" type="password" className="h-11" value={next} onChange={(e) => setNext(e.target.value)} minLength={8} required />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="h-11">Cambiar</Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => logoutAccount()}>
              Salir
            </Button>
          </div>
        </form>
        {msg ? <p className="mt-3 text-sm text-muted-foreground">{msg}</p> : null}
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Claves firmadas (plan B)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Con la base de datos ya no hacen falta claves para vender Pro. Siguen sirviendo para
          regalar Pro a alguien sin cuenta. La clave privada vive en este navegador: si la usas,
          descarga copia.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="h-11"
            disabled={!signing}
            onClick={() =>
              downloadText(
                `luna-oficio-claves-${new Date().toISOString().slice(0, 10)}.json`,
                exportBackup(true),
                "application/json",
              )
            }
          >
            Descargar copia de la clave privada
          </Button>
        </div>
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="restore">Restaurar copia (.json)</Label>
          <Input id="restore" type="file" accept="application/json" className="h-11" onChange={(e) => void onFile(e)} />
        </div>
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Este navegador</h2>
        <div className="mt-2">
          <ConsentControls />
        </div>
      </section>
    </div>
  );
}
