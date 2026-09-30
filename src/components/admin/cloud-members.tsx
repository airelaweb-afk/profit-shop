"use client";

import { useState } from "react";
import { Empty, ErrorNote, StatusPill } from "@/components/admin/admin-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { downloadText } from "@/lib/admin";
import {
  adminDeleteMembership,
  adminGrantPro,
  adminListMemberships,
  adminSetMembershipStatus,
  adminUpdateMembershipNotes,
  membershipsToCsv,
} from "@/lib/cloud";
import type { MembershipRow } from "@/lib/supabase";
import { formatEur, formatIsoEs } from "@/lib/use-admin";
import { useCloudQuery, useDebounced } from "@/lib/use-cloud";

const METHODS: { value: MembershipRow["method"]; label: string }[] = [
  { value: "stripe", label: "Stripe (tarjeta)" },
  { value: "revolut", label: "Revolut" },
  { value: "bizum", label: "Bizum" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

function effectiveStatus(m: MembershipRow) {
  if (m.status !== "activo") return m.status;
  return new Date(m.expires_at).getTime() > Date.now() ? "activo" : "caducado";
}

function GrantForm({
  onDone,
  prefill,
}: {
  onDone: (row: MembershipRow) => void;
  prefill?: { email: string; name: string };
}) {
  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [method, setMethod] = useState<MembershipRow["method"]>("revolut");
  const [amount, setAmount] = useState("29");
  const [months, setMonths] = useState("12");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const row = await adminGrantPro({
        email,
        name,
        method,
        amount: Number(amount.replace(",", ".")) || 0,
        months: Math.max(1, Number(months) || 12),
        paidAt,
        notes,
      });
      onDone(row);
      setName("");
      setEmail("");
      setNotes("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="rounded-[2px] border-2 border-foreground bg-card p-5"
    >
      <h2 className="font-heading text-2xl">Dar de alta un socio Pro</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Los pagos con tarjeta entran solos por el webhook de Stripe. Esto es para Revolut,
        Bizum, transferencia o regalos. Si ya tiene cuenta con ese correo, Pro se le activa
        al instante; si no, se activa en cuanto se registre con él.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="c-name">Nombre</Label>
          <Input id="c-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-email">Correo</Label>
          <Input id="c-email" type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-method">Cómo ha pagado</Label>
          <select
            id="c-method"
            className="h-11 rounded-[2px] border border-input bg-background px-3 text-sm"
            value={method}
            onChange={(e) => setMethod(e.target.value as MembershipRow["method"])}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-amount">Importe (€)</Label>
          <Input id="c-amount" inputMode="decimal" className="h-11" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-months">Meses de Pro</Label>
          <Input id="c-months" type="number" min={1} max={120} className="h-11" value={months} onChange={(e) => setMonths(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="c-paid">Fecha de pago (opcional)</Label>
          <Input id="c-paid" type="date" className="h-11" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="c-notes">Notas</Label>
          <Textarea id="c-notes" rows={2} placeholder="Pidió factura con NIF…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <ErrorNote message={error} />
      </div>
      <Button type="submit" className="mt-4 h-11" disabled={busy}>
        {busy ? "Guardando…" : "Guardar y activar Pro"}
      </Button>
    </form>
  );
}

function MemberRow({ m, onChange }: { m: MembershipRow; onChange: () => void }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(m.notes);
  const [error, setError] = useState("");
  const status = effectiveStatus(m);

  async function run(action: () => Promise<void>) {
    setError("");
    try {
      await action();
      onChange();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error.");
    }
  }

  return (
    <li className="rounded-[2px] bg-card p-4 ring-1 ring-foreground/15">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-heading text-lg">
            {m.name || m.email}
            {m.name ? <span className="ml-2 text-sm font-normal text-muted-foreground">{m.email}</span> : null}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <StatusPill status={status} />
            <span>
              {METHODS.find((x) => x.value === m.method)?.label ?? m.method}
              {m.source === "stripe" ? " · automático" : ""}
            </span>
            <span>{formatEur(m.amount_cents / 100)}</span>
            <span>
              {formatIsoEs(m.starts_at)} → {formatIsoEs(m.expires_at)}
            </span>
            {!m.user_id ? <span className="text-primary">sin cuenta todavía</span> : null}
          </p>
          {m.notes && !editing ? <p className="mt-1 text-sm">{m.notes}</p> : null}
        </div>
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" className="h-9" onClick={() => setEditing((v) => !v)}>
            Notas
          </Button>
          {m.status === "activo" ? (
            <>
              <Button variant="ghost" className="h-9" onClick={() => void run(() => adminSetMembershipStatus(m.id, "revocado"))}>
                Anular
              </Button>
              <Button variant="ghost" className="h-9" onClick={() => void run(() => adminSetMembershipStatus(m.id, "reembolsado"))}>
                Reembolsado
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="h-9" onClick={() => void run(() => adminSetMembershipStatus(m.id, "activo"))}>
              Reactivar
            </Button>
          )}
          <Button
            variant="ghost"
            className="h-9 text-destructive"
            onClick={() => {
              if (confirm(`¿Borrar el cobro de ${m.email}? Si es de Stripe, mejor márcalo como reembolsado.`)) {
                void run(() => adminDeleteMembership(m.id));
              }
            }}
          >
            Borrar
          </Button>
        </div>
      </div>
      {editing ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void run(() => adminUpdateMembershipNotes(m.id, notes)).then(() => setEditing(false));
          }}
        >
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex gap-2">
            <Button type="submit" className="h-9">Guardar notas</Button>
            <Button type="button" variant="outline" className="h-9" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        </form>
      ) : null}
      <ErrorNote message={error} />
    </li>
  );
}

export function CloudMembers({ prefill }: { prefill?: { email: string; name: string } }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"todos" | MembershipRow["status"]>("todos");
  const debounced = useDebounced(search);
  const list = useCloudQuery(
    () => adminListMemberships({ search: debounced, status }),
    [debounced, status],
  );
  const [last, setLast] = useState<MembershipRow | null>(null);

  return (
    <div className="grid gap-6">
      <GrantForm
        prefill={prefill}
        onDone={(row) => {
          setLast(row);
          list.reload();
        }}
      />

      {last ? (
        <div className="rounded-[2px] bg-foreground p-5 text-background">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-accent uppercase">
            Pro activado · hasta {formatIsoEs(last.expires_at)}
          </p>
          <p className="mt-2 text-sm">
            {last.user_id
              ? `${last.email} ya tiene Pro en su cuenta. No hace falta enviar nada: le aparece al entrar.`
              : `${last.email} aún no tiene cuenta. En cuanto se registre con ese correo, Pro se le activa solo.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="h-10"
              render={
                <a
                  href={`mailto:${last.email}?subject=${encodeURIComponent("Tu Pro de Luna Oficio está activo")}&body=${encodeURIComponent(
                    `Hola${last.name ? ` ${last.name}` : ""},\n\nGracias por el pago. Pro ya está activo en tu cuenta de Luna Oficio hasta el ${formatIsoEs(last.expires_at)}.\n\n${last.user_id ? "Entra en https://lunaoficio.com/entrar/ con este correo y verás la web sin anuncios en cualquier aparato." : "Crea tu cuenta en https://lunaoficio.com/entrar/?tab=crear con este mismo correo y Pro se activará solo."}\n\nUn saludo,\nLuna Oficio`,
                  )}`}
                />
              }
              nativeButton={false}
            >
              Avisar por correo
            </Button>
            <Button variant="ghost" className="h-10 text-background hover:bg-background/10 hover:text-background" onClick={() => setLast(null)}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl">
          Libro de socios{list.data ? ` (${list.data.length})` : ""}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10" onClick={list.reload}>
            Actualizar
          </Button>
          <Button
            variant="outline"
            className="h-10"
            disabled={!list.data || list.data.length === 0}
            onClick={() =>
              downloadText(
                `luna-oficio-socios-${new Date().toISOString().slice(0, 10)}.csv`,
                membershipsToCsv(list.data ?? []),
                "text/csv",
              )
            }
          >
            Exportar CSV
          </Button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Input
          className="h-11"
          placeholder="Buscar por nombre, correo o nota"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-11 rounded-[2px] border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="revocado">Anulados</option>
          <option value="reembolsado">Reembolsados</option>
        </select>
      </div>
      <ErrorNote message={list.error} />
      {list.loading && !list.data ? (
        <Empty>Cargando socios…</Empty>
      ) : !list.data || list.data.length === 0 ? (
        <Empty>
          {search || status !== "todos"
            ? "Nada con ese filtro."
            : "Todavía no hay socios Pro. El primero que pague con Stripe aparecerá aquí solo."}
        </Empty>
      ) : (
        <ul className="grid gap-2">
          {list.data.map((m) => (
            <MemberRow key={m.id} m={m} onChange={list.reload} />
          ))}
        </ul>
      )}
    </div>
  );
}
