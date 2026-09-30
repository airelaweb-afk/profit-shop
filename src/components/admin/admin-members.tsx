"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteMember,
  downloadText,
  getSigningKey,
  issueMember,
  listMembers,
  memberIsCurrent,
  membersToCsv,
  setMemberStatus,
  updateMemberNotes,
  type Member,
  type MemberStatus,
  type PayMethod,
} from "@/lib/admin";
import { LEGAL, SITE_URL } from "@/lib/site";
import { formatDateEs, formatEur, formatIsoEs } from "@/lib/use-admin";

const METHODS: { value: PayMethod; label: string }[] = [
  { value: "stripe", label: "Stripe (tarjeta)" },
  { value: "revolut", label: "Revolut" },
  { value: "bizum", label: "Bizum" },
  { value: "transferencia", label: "Transferencia" },
  { value: "otro", label: "Otro" },
];

function mailtoFor(member: Member) {
  const subject = "Tu clave de Luna Oficio Pro";
  const body = [
    `Hola ${member.name},`,
    "",
    "Gracias por Pro. Esta es tu clave:",
    "",
    member.key,
    "",
    `Actívala en ${SITE_URL}/precios/ (apartado «Activar clave»). Vale hasta el ${formatDateEs(member.expires)} y vive en el navegador donde la actives; si cambias de aparato, vuelve a pegarla.`,
    "",
    "Sin anuncios y con marca de agua en PDF. Los archivos siguen en tu navegador.",
    "",
    `Luna Oficio · ${LEGAL.email}`,
  ].join("\n");
  return `mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function StatusPill({ member }: { member: Member }) {
  const expired = member.status === "activo" && !memberIsCurrent(member);
  const label = expired ? "caducado" : member.status;
  const tone =
    member.status === "activo" && !expired
      ? "bg-foreground text-background"
      : member.status === "revocado"
        ? "bg-destructive/15 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-block rounded-[2px] px-2 py-0.5 font-mono text-[0.65rem] tracking-widest uppercase ${tone}`}>
      {label}
    </span>
  );
}

function MemberRow({
  member,
  onRenew,
}: {
  member: Member;
  onRenew: (member: Member) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(member.notes);
  const [copied, setCopied] = useState(false);
  return (
    <li className="rounded-[2px] bg-card ring-1 ring-foreground/15">
      <button
        type="button"
        className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="font-heading text-lg">{member.name}</span>{" "}
          <span className="block truncate text-sm text-muted-foreground sm:inline">
            {member.email}
          </span>
        </span>
        <span className="flex flex-wrap items-center gap-3 text-xs">
          <StatusPill member={member} />
          <span className="font-mono">{member.serial}</span>
          <span>hasta {formatDateEs(member.expires)}</span>
          <span>{formatEur(member.amount)}</span>
        </span>
      </button>
      {open ? (
        <div className="border-t border-foreground/10 p-4 text-sm">
          <dl className="grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Pagado</dt>
              <dd>
                {formatIsoEs(member.paidAt)} · {METHODS.find((m) => m.value === member.method)?.label}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Alta en el libro</dt>
              <dd>{formatIsoEs(member.createdAt)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Clave</dt>
              <dd className="mt-1 break-all rounded-[2px] bg-muted p-2 font-mono text-xs">
                {member.key}
              </dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-10"
              onClick={async () => {
                setCopied(await copy(member.key));
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? "Copiada" : "Copiar clave"}
            </Button>
            <Button
              variant="outline"
              className="h-10"
              render={<a href={mailtoFor(member)} />}
              nativeButton={false}
            >
              Enviar por correo
            </Button>
            <Button variant="outline" className="h-10" onClick={() => onRenew(member)}>
              Renovar (nueva clave)
            </Button>
            {member.status === "activo" ? (
              <Button
                variant="outline"
                className="h-10 text-destructive"
                onClick={() => {
                  if (confirm(`¿Revocar la clave ${member.serial}? Añade el serial a NEXT_PUBLIC_PRO_REVOKED para que la web la rechace.`)) {
                    setMemberStatus(member.id, "revocado");
                  }
                }}
              >
                Revocar
              </Button>
            ) : (
              <Button
                variant="outline"
                className="h-10"
                onClick={() => setMemberStatus(member.id, "activo")}
              >
                Reactivar
              </Button>
            )}
            {member.status !== "reembolsado" ? (
              <Button
                variant="ghost"
                className="h-10"
                onClick={() => setMemberStatus(member.id, "reembolsado" as MemberStatus)}
              >
                Marcar reembolso
              </Button>
            ) : null}
            <Button
              variant="ghost"
              className="h-10 text-destructive"
              onClick={() => {
                if (confirm("¿Borrar este socio del libro? No se puede deshacer.")) {
                  deleteMember(member.id);
                }
              }}
            >
              Borrar
            </Button>
          </div>
          <div className="mt-4 grid gap-1.5">
            <Label htmlFor={`notes-${member.id}`}>Notas</Label>
            <Textarea
              id={`notes-${member.id}`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onBlur={() => updateMemberNotes(member.id, notes)}
              placeholder="Factura enviada, pidió recibo, etc."
            />
          </div>
        </div>
      ) : null}
    </li>
  );
}

export function AdminMembers() {
  const members = listMembers();
  const signing = Boolean(getSigningKey());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<PayMethod>("stripe");
  const [amount, setAmount] = useState("29");
  const [months, setMonths] = useState("12");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [renewedFrom, setRenewedFrom] = useState<string | undefined>();
  const [issued, setIssued] = useState<Member | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "al-dia" | "caducados" | "revocados">("todos");

  async function onIssue(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const member = await issueMember({
        name,
        email,
        method,
        amount: Number(amount.replace(",", ".")),
        months: Number(months),
        notes,
        paidAt,
        renewedFrom,
      });
      setIssued(member);
      setName("");
      setEmail("");
      setNotes("");
      setPaidAt("");
      setRenewedFrom(undefined);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo emitir.");
    } finally {
      setBusy(false);
    }
  }

  function prepareRenew(member: Member) {
    setName(member.name);
    setEmail(member.email);
    setMethod(member.method);
    setAmount(String(member.amount));
    setRenewedFrom(member.id);
    setIssued(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (q && !`${m.name} ${m.email} ${m.serial}`.toLowerCase().includes(q)) return false;
    if (filter === "al-dia") return memberIsCurrent(m);
    if (filter === "caducados") return m.status === "activo" && !memberIsCurrent(m);
    if (filter === "revocados") return m.status !== "activo";
    return true;
  });

  return (
    <div className="grid gap-8">
      <form
        onSubmit={(event) => void onIssue(event)}
        className="rounded-[2px] border-2 border-foreground bg-card p-5"
      >
        <h2 className="font-heading text-2xl">
          {renewedFrom ? "Renovar socio" : "Dar de alta un socio Pro"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Cuando veas el pago en Stripe o Revolut, apúntalo aquí. Se firma una clave
          única y la mandas por correo.
        </p>
        {!signing ? (
          <p className="mt-3 rounded-[2px] bg-accent px-3 py-2 text-sm">
            Falta la clave de firma. Créala en la pestaña Claves.
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="m-name">Nombre</Label>
            <Input id="m-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-email">Correo</Label>
            <Input id="m-email" type="email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-method">Cómo ha pagado</Label>
            <select
              id="m-method"
              className="h-11 rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value as PayMethod)}
            >
              {METHODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-amount">Importe (€)</Label>
            <Input id="m-amount" inputMode="decimal" className="h-11" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-months">Meses de Pro</Label>
            <Input id="m-months" type="number" min={1} max={60} className="h-11" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="m-paid">Fecha de pago (opcional)</Label>
            <Input id="m-paid" type="date" className="h-11" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="m-notes">Notas</Label>
            <Input id="m-notes" className="h-11" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Pidió factura con NIF…" />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="submit" className="h-12" disabled={busy || !signing}>
            {busy ? "Firmando…" : "Emitir clave y guardar"}
          </Button>
          {renewedFrom ? (
            <Button type="button" variant="ghost" className="h-12" onClick={() => setRenewedFrom(undefined)}>
              Cancelar renovación
            </Button>
          ) : null}
        </div>
      </form>

      {issued ? (
        <div className="rounded-[2px] bg-foreground p-5 text-background">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-accent uppercase">
            Clave emitida · {issued.serial} · hasta {formatDateEs(issued.expires)}
          </p>
          <p className="mt-2 break-all font-mono text-sm">{issued.key}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="h-11" onClick={() => void copy(issued.key)}>
              Copiar clave
            </Button>
            <Button
              className="h-11 border-2 border-accent bg-accent text-accent-foreground hover:bg-accent/90"
              render={<a href={mailtoFor(issued)} />}
              nativeButton={false}
            >
              Enviar a {issued.email}
            </Button>
          </div>
        </div>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-heading text-2xl">Libro de socios ({members.length})</h2>
          <Button
            variant="outline"
            className="h-10"
            disabled={members.length === 0}
            onClick={() =>
              downloadText(
                `luna-oficio-socios-${new Date().toISOString().slice(0, 10)}.csv`,
                membersToCsv(members),
                "text/csv",
              )
            }
          >
            Exportar CSV
          </Button>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            className="h-11"
            placeholder="Buscar por nombre, correo o serial"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="h-11 rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            aria-label="Filtro"
          >
            <option value="todos">Todos</option>
            <option value="al-dia">Al día</option>
            <option value="caducados">Caducados</option>
            <option value="revocados">Revocados / reembolsos</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <p className="mt-4 rounded-[2px] bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/15">
            {members.length === 0
              ? "Todavía no hay socios. El primero que pague en Stripe o Revolut lo apuntas arriba."
              : "Nada con ese filtro."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {filtered.map((member) => (
              <MemberRow key={member.id} member={member} onRenew={prepareRenew} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
