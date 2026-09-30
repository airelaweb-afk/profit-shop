"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addNote,
  deleteNote,
  getSigningKey,
  listMembers,
  listNotes,
  memberExpiresSoon,
  memberIsCurrent,
  toggleNote,
} from "@/lib/admin";
import { listAccounts } from "@/lib/auth";
import { hasRevolutPay, hasStripePay } from "@/lib/payments";
import { hasPublicKey } from "@/lib/pro-keys";
import { ADSENSE_CLIENT } from "@/lib/site";
import { formatDateEs, formatEur } from "@/lib/use-admin";

function Kpi({
  label,
  value,
  tone = "bone",
}: {
  label: string;
  value: string | number;
  tone?: "bone" | "ink" | "signal" | "yellow";
}) {
  const classes = {
    bone: "bg-card text-foreground ring-1 ring-foreground/15",
    ink: "bg-foreground text-background",
    signal: "bg-primary text-primary-foreground",
    yellow: "bg-accent text-accent-foreground",
  }[tone];
  return (
    <div className={`rounded-[2px] p-4 ${classes}`}>
      <p className="font-mono text-[0.65rem] tracking-[0.18em] uppercase opacity-75">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl tracking-tight">{value}</p>
    </div>
  );
}

function Check({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-start gap-3 border-b border-foreground/10 py-3 last:border-0">
      <span
        className={`mt-0.5 inline-block size-3 shrink-0 rounded-full ${ok ? "bg-primary" : "bg-foreground/25"}`}
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </li>
  );
}

export function AdminOverview() {
  const members = listMembers();
  const current = members.filter((m) => memberIsCurrent(m));
  const soon = members.filter((m) => memberExpiresSoon(m));
  const revenue = members
    .filter((m) => m.status !== "reembolsado")
    .reduce((sum, m) => sum + m.amount, 0);
  const accounts = listAccounts();
  const notes = listNotes();
  const [note, setNote] = useState("");
  const signing = Boolean(getSigningKey());

  return (
    <div className="grid gap-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Socios Pro al día" value={current.length} tone="ink" />
        <Kpi label="Caducan en 30 días" value={soon.length} tone="yellow" />
        <Kpi label="Cobrado (registrado)" value={formatEur(revenue)} tone="signal" />
        <Kpi label="Cuentas en este aparato" value={accounts.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <h2 className="font-heading text-xl">Estado del negocio</h2>
          <ul className="mt-2">
            <Check
              ok={signing}
              label="Clave de firma creada"
              hint={signing ? "Puedes emitir claves Pro." : "Pestaña Claves → Crear clave de firma."}
            />
            <Check
              ok={hasPublicKey()}
              label="Clave pública publicada en la web"
              hint={
                hasPublicKey()
                  ? "La web verifica las claves firmadas."
                  : "Sin ella la web solo acepta la clave maestra de pruebas. Pega la pública en Hostinger (NEXT_PUBLIC_PRO_PUBLIC_KEY) y vuelve a desplegar."
              }
            />
            <Check
              ok={hasStripePay()}
              label="Stripe Payment Link"
              hint={hasStripePay() ? "Botón de tarjeta activo en /precios." : "Falta NEXT_PUBLIC_STRIPE_PAYMENT_LINK."}
            />
            <Check
              ok={hasRevolutPay()}
              label="Revolut"
              hint={hasRevolutPay() ? "Botón Revolut activo en /precios." : "Falta NEXT_PUBLIC_REVOLUT_PAYMENT_LINK."}
            />
            <Check
              ok={ADSENSE_CLIENT.length > 0}
              label="AdSense"
              hint={ADSENSE_CLIENT ? `Cliente ${ADSENSE_CLIENT}.` : "Hueco de anuncio de casa hasta que haya ID."}
            />
          </ul>
        </section>

        <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <h2 className="font-heading text-xl">Caducan pronto</h2>
          {soon.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nadie caduca en los próximos 30 días.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-foreground/10 text-sm">
              {soon.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium">{m.name}</span>{" "}
                    <span className="text-muted-foreground">{m.email}</span>
                  </span>
                  <span className="font-mono text-xs">{formatDateEs(m.expires)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Renueva desde Socios: emite una clave nueva y mándala por correo.
          </p>
        </section>
      </div>

      <section className="rounded-[2px] bg-foreground p-5 text-background">
        <h2 className="font-heading text-xl">Qué ves y qué no (sin servidor)</h2>
        <ul className="mt-3 grid gap-2 text-sm text-background/80 sm:grid-cols-2">
          <li>
            <span className="text-accent">Sí:</span> quién ha pagado y hasta cuándo. Tú
            registras cada cobro aquí y emites su clave.
          </li>
          <li>
            <span className="text-accent">Sí:</span> las cuentas gratuitas creadas en
            <em> este</em> aparato.
          </li>
          <li>
            <span className="text-primary">No:</span> las cuentas gratuitas de otros
            teléfonos. Viven en su navegador; no hay base de datos nuestra. Es la
            promesa de privacidad de la web.
          </li>
          <li>
            <span className="text-primary">No:</span> visitas. Para eso, Search Console
            y, si quieres, un contador sin cookies.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <a className="underline underline-offset-4 hover:text-accent" href="https://dashboard.stripe.com/payments" target="_blank" rel="noreferrer">Stripe · pagos</a>
          <a className="underline underline-offset-4 hover:text-accent" href="https://business.revolut.com/" target="_blank" rel="noreferrer">Revolut</a>
          <a className="underline underline-offset-4 hover:text-accent" href="https://search.google.com/search-console" target="_blank" rel="noreferrer">Search Console</a>
          <a className="underline underline-offset-4 hover:text-accent" href="https://hpanel.hostinger.com/" target="_blank" rel="noreferrer">Hostinger hPanel</a>
        </div>
      </section>

      <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
        <h2 className="font-heading text-xl">Pendientes</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            addNote(note);
            setNote("");
          }}
        >
          <Input
            className="h-11"
            placeholder="Mandar clave a Marta; pedir factura Stripe…"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button type="submit" className="h-11">
            Añadir
          </Button>
        </form>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nada pendiente.</p>
        ) : (
          <ul className="mt-3 divide-y divide-foreground/10 text-sm">
            {notes.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleNote(item.id)}
                  aria-label="Hecho"
                />
                <span className={item.done ? "flex-1 line-through opacity-60" : "flex-1"}>
                  {item.text}
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => deleteNote(item.id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
