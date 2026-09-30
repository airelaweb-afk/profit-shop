"use client";

import { useState } from "react";
import { ConsentControls } from "@/components/consent-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changeAdminPassword,
  downloadText,
  exportBackup,
  importBackup,
  lockAdmin,
  wipeAdmin,
} from "@/lib/admin";
import { hasRevolutPay, hasStripePay, REVOLUT_PAYMENT_LINK, STRIPE_PAYMENT_LINK } from "@/lib/payments";
import { deactivatePro } from "@/lib/pro";
import { ADSENSE_CLIENT, LEGAL, SITE_URL } from "@/lib/site";
import { useProState } from "@/lib/use-consent";
import { formatDateEs } from "@/lib/use-admin";

export function AdminSettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState("");
  const pro = useProState();

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { members } = importBackup(await file.text());
      setMsg(`Copia restaurada. ${members} socios nuevos.`);
    } catch (caught) {
      setMsg(caught instanceof Error ? caught.message : "No se pudo importar.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2px] border-2 border-foreground bg-card p-5">
        <h2 className="font-heading text-2xl">Copia de seguridad del panel</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          El libro de socios vive en este navegador. Si borras datos o cambias de
          ordenador, se pierde. Descarga una copia cada vez que des de alta a alguien.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            className="h-11"
            onClick={() =>
              downloadText(
                `luna-oficio-panel-${new Date().toISOString().slice(0, 10)}.json`,
                exportBackup(true),
                "application/json",
              )
            }
          >
            Descargar copia completa (con clave privada)
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() =>
              downloadText(
                `luna-oficio-socios-${new Date().toISOString().slice(0, 10)}.json`,
                exportBackup(false),
                "application/json",
              )
            }
          >
            Solo socios y notas
          </Button>
        </div>
        <div className="mt-4 grid gap-1.5">
          <Label htmlFor="restore">Restaurar copia (.json)</Label>
          <Input id="restore" type="file" accept="application/json" className="h-11" onChange={(e) => void onFile(e)} />
        </div>
        {msg ? <p className="mt-3 text-sm text-muted-foreground">{msg}</p> : null}
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Cobros y anuncios</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">Stripe Payment Link</dt>
            <dd className="break-all">{hasStripePay() ? STRIPE_PAYMENT_LINK : "Sin configurar (NEXT_PUBLIC_STRIPE_PAYMENT_LINK)"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Revolut</dt>
            <dd className="break-all">{hasRevolutPay() ? REVOLUT_PAYMENT_LINK : "Sin configurar (NEXT_PUBLIC_REVOLUT_PAYMENT_LINK)"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">AdSense</dt>
            <dd>{ADSENSE_CLIENT || "Sin ID: anuncio de casa"}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Correo de contacto</dt>
            <dd>{LEGAL.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">URL de éxito para Stripe</dt>
            <dd className="font-mono text-xs">{SITE_URL}/precios/?pago=ok</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Este navegador</h2>
        <p className="mt-2 text-sm">
          Pro aquí:{" "}
          {pro ? (
            <>
              activo · serial <span className="font-mono">{pro.serial}</span> · hasta{" "}
              {formatDateEs(pro.expires)}
              <Button variant="ghost" className="ml-2 h-8" onClick={() => deactivatePro()}>
                Quitar
              </Button>
            </>
          ) : (
            "no activo"
          )}
        </p>
        <div className="mt-4">
          <ConsentControls />
        </div>
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-2xl">Contraseña del panel</h2>
        <form
          className="mt-3 grid gap-3 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await changeAdminPassword(current, next);
              setCurrent("");
              setNext("");
              setMsg("Contraseña del panel cambiada.");
            } catch (caught) {
              setMsg(caught instanceof Error ? caught.message : "Error.");
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="pw-current">Actual</Label>
            <Input id="pw-current" type="password" className="h-11" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pw-next">Nueva (mín. 10)</Label>
            <Input id="pw-next" type="password" className="h-11" value={next} onChange={(e) => setNext(e.target.value)} minLength={10} required />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" className="h-11">
              Cambiar
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => lockAdmin()}>
              Cerrar el panel
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-[2px] border-2 border-destructive/40 bg-card p-5">
        <h2 className="font-heading text-2xl text-destructive">Zona roja</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Borra acceso, clave privada, socios y notas de este navegador. Descarga la copia antes.
        </p>
        <Button
          variant="destructive"
          className="mt-3 h-11"
          onClick={() => {
            if (confirm("¿Borrar TODO el panel de este navegador? Sin copia, se pierde el libro de socios.")) {
              wipeAdmin();
            }
          }}
        >
          Borrar el panel de este navegador
        </Button>
      </section>
    </div>
  );
}
