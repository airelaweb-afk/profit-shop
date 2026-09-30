"use client";

import { useState } from "react";
import { Check, Empty, ErrorNote, Kpi } from "@/components/admin/admin-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSigningKey } from "@/lib/admin";
import {
  adminAddNote,
  adminDeleteNote,
  adminListMemberships,
  adminListNotes,
  adminStats,
  adminToggleNote,
} from "@/lib/cloud";
import { hasRevolutPay, hasStripePay } from "@/lib/payments";
import { hasPublicKey } from "@/lib/pro-keys";
import { ADSENSE_CLIENT } from "@/lib/site";
import { SUPABASE_URL } from "@/lib/supabase";
import { formatEur, formatIsoEs } from "@/lib/use-admin";
import { useCloudQuery } from "@/lib/use-cloud";

function projectRef() {
  try {
    return new URL(SUPABASE_URL).hostname.split(".")[0];
  } catch {
    return "";
  }
}

export function CloudOverview() {
  const stats = useCloudQuery(() => adminStats(), []);
  const soon = useCloudQuery(async () => {
    const rows = await adminListMemberships({ status: "activo", limit: 200 });
    const now = Date.now();
    const limit = now + 30 * 86_400_000;
    return rows
      .filter((m) => {
        const t = new Date(m.expires_at).getTime();
        return t > now && t <= limit;
      })
      .sort((a, b) => a.expires_at.localeCompare(b.expires_at));
  }, []);
  const notes = useCloudQuery(() => adminListNotes(), []);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const s = stats.data;
  const signing = Boolean(getSigningKey());
  const ref = projectRef();

  return (
    <div className="grid gap-8">
      <ErrorNote message={stats.error} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Socios Pro al día"
          value={s ? s.pro_active : "…"}
          tone="ink"
          hint={s ? `${s.pro_expiring_30d} caducan en 30 días` : undefined}
        />
        <Kpi
          label="Registros"
          value={s ? s.users_total : "…"}
          tone="yellow"
          hint={s ? `${s.users_7d} esta semana · ${s.users_30d} este mes` : undefined}
        />
        <Kpi
          label="Cobrado"
          value={s ? formatEur(s.revenue_cents / 100) : "…"}
          tone="signal"
          hint={s ? `${formatEur(s.revenue_30d_cents / 100)} en 30 días` : undefined}
        />
        <Kpi
          label="Cobros"
          value={s ? s.memberships_total : "…"}
          hint={
            s
              ? `${s.stripe_count} por Stripe${s.memberships_unlinked ? ` · ${s.memberships_unlinked} sin cuenta aún` : ""}`
              : undefined
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <h2 className="font-heading text-xl">Estado del negocio</h2>
          <ul className="mt-2">
            <Check
              ok={!stats.error}
              label="Base de datos conectada"
              hint={stats.error ? "Revisa la URL y la anon key en Hostinger." : `Proyecto ${ref || "Supabase"}.`}
            />
            <Check
              ok={hasStripePay()}
              label="Stripe Payment Link"
              hint={hasStripePay() ? "Botón de tarjeta activo en /precios." : "Falta NEXT_PUBLIC_STRIPE_PAYMENT_LINK."}
            />
            <Check
              ok={Boolean(s && s.stripe_count > 0)}
              label="Webhook de Stripe funcionando"
              hint={
                s && s.stripe_count > 0
                  ? `${s.stripe_count} cobros han entrado solos.`
                  : "Ningún cobro automático todavía. Comprueba el endpoint en Stripe → Developers → Webhooks."
              }
            />
            <Check
              ok={hasRevolutPay()}
              label="Revolut"
              hint={hasRevolutPay() ? "Botón Revolut activo. Las altas por Revolut se hacen a mano en Socios." : "Falta NEXT_PUBLIC_REVOLUT_PAYMENT_LINK."}
            />
            <Check
              ok={signing && hasPublicKey()}
              label="Claves firmadas (plan B sin cuenta)"
              hint={
                signing && hasPublicKey()
                  ? "Puedes emitir claves para regalos o pagos fuera de Stripe."
                  : "Opcional: pestaña Claves si quieres dar Pro a alguien sin cuenta."
              }
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
          {soon.loading ? (
            <p className="mt-2 text-sm text-muted-foreground">Cargando…</p>
          ) : !soon.data || soon.data.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Nadie caduca en los próximos 30 días.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-foreground/10 text-sm">
              {soon.data.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium">{m.name || m.email}</span>{" "}
                    {m.name ? <span className="text-muted-foreground">{m.email}</span> : null}
                  </span>
                  <span className="font-mono text-xs">{formatIsoEs(m.expires_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Cuando renuevan por Stripe se amplía solo. Si pagan por otro medio, alta manual en
            Socios: el nuevo año empieza cuando acaba el actual.
          </p>
          {s?.last_signup_at || s?.last_payment_at ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Último registro: {s.last_signup_at ? formatIsoEs(s.last_signup_at) : "—"} · último
              cobro: {s.last_payment_at ? formatIsoEs(s.last_payment_at) : "—"}
            </p>
          ) : null}
        </section>
      </div>

      <section className="rounded-[2px] bg-foreground p-5 text-background">
        <h2 className="font-heading text-xl">Qué ves ahora (con base de datos)</h2>
        <ul className="mt-3 grid gap-2 text-sm text-background/80 sm:grid-cols-2">
          <li>
            <span className="text-accent">Sí:</span> todos los registros, de cualquier aparato:
            correo, nombre, fecha de alta y último acceso.
          </li>
          <li>
            <span className="text-accent">Sí:</span> quién tiene Pro y hasta cuándo. Stripe lo
            marca solo; Revolut y Bizum los apuntas tú.
          </li>
          <li>
            <span className="text-primary">No:</span> los PDF, fotos y presupuestos de la gente.
            Se procesan en su navegador y no se suben. Es la promesa de la web.
          </li>
          <li>
            <span className="text-primary">No:</span> visitas. Para eso, Search Console y, si
            quieres, un contador sin cookies.
          </li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {ref ? (
            <a className="underline underline-offset-4 hover:text-accent" href={`https://supabase.com/dashboard/project/${ref}`} target="_blank" rel="noreferrer">Supabase</a>
          ) : null}
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
            setNoteError("");
            adminAddNote(note)
              .then(() => {
                setNote("");
                notes.reload();
              })
              .catch((caught: unknown) =>
                setNoteError(caught instanceof Error ? caught.message : "No se pudo guardar."),
              );
          }}
        >
          <Input
            className="h-11"
            placeholder="Factura para Marta; revisar webhook…"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Button type="submit" className="h-11">
            Añadir
          </Button>
        </form>
        <div className="mt-3">
          <ErrorNote message={noteError || notes.error} />
        </div>
        {notes.loading ? (
          <p className="mt-3 text-sm text-muted-foreground">Cargando…</p>
        ) : !notes.data || notes.data.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nada pendiente.</p>
        ) : (
          <ul className="mt-3 divide-y divide-foreground/10 text-sm">
            {notes.data.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => void adminToggleNote(item.id, !item.done).then(notes.reload)}
                  aria-label="Hecho"
                />
                <span className={item.done ? "flex-1 line-through opacity-60" : "flex-1"}>
                  {item.text}
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => void adminDeleteNote(item.id).then(notes.reload)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {!s && !stats.loading && !stats.error ? <Empty>Sin datos todavía.</Empty> : null}
    </div>
  );
}
