"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatEuro } from "@/lib/quotes";
import {
  mailLink,
  parseDebtors,
  reminderBody,
  reminderSubject,
  sampleDebtText,
  sampleSender,
  waLink,
  type Debtor,
  type ReminderChannel,
  type ReminderRound,
} from "@/lib/reminders";

const KEY = "luna-oficio-reminders";
const EMPTY = "";
const listeners = new Set<() => void>();

type Stored = {
  sender: string;
  round: ReminderRound;
  channel: ReminderChannel;
  list: string;
};

const emptyStored: Stored = {
  sender: "",
  round: "primera",
  channel: "whatsapp",
  list: "",
};

const sampleStored: Stored = {
  sender: sampleSender,
  round: "primera",
  channel: "whatsapp",
  list: sampleDebtText,
};

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseStored(json: string): Stored {
  if (!json) return structuredClone(emptyStored);
  try {
    const parsed = JSON.parse(json) as Partial<Stored>;
    return {
      sender: parsed.sender ?? "",
      round: parsed.round ?? "primera",
      channel: parsed.channel ?? "whatsapp",
      list: parsed.list ?? "",
    };
  } catch {
    return structuredClone(emptyStored);
  }
}

function write(next: Stored) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

function getSnapshot() {
  return window.localStorage.getItem(KEY) ?? EMPTY;
}

function getServerSnapshot() {
  return EMPTY;
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function ReminderBatchTool() {
  const json = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const stored = useMemo(() => parseStored(json), [json]);
  const debtors = useMemo(() => parseDebtors(stored.list), [stored.list]);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");

  function patch(partial: Partial<Stored>) {
    write({ ...stored, ...partial });
  }

  const messages = debtors.map((debtor) => ({
    debtor,
    subject: reminderSubject(debtor, stored.round),
    body: reminderBody(debtor, stored.round, stored.sender, stored.channel),
  }));

  async function copyOne(id: string, value: string) {
    const ok = await copyText(value);
    if (!ok) {
      setError("No se pudo copiar. Selecciona el texto a mano.");
      return;
    }
    setError("");
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function copyAll() {
    if (messages.length === 0) {
      setError("Pega al menos una línea con nombre e importe.");
      return;
    }
    const blob = messages
      .map(({ debtor, subject, body }, index) => {
        const head =
          stored.channel === "email"
            ? `${index + 1}. ${debtor.company}\nAsunto: ${subject}\n`
            : `${index + 1}. ${debtor.company}\n`;
        return `${head}${body}`;
      })
      .join("\n\n———\n\n");
    await copyOne("all", blob);
  }

  const totalCents = debtors.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void copyAll();
        }}
      >
        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl">Tu firma</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Nada se envía solo. Copias, WhatsApp o correo: tú pegas el
                mensaje.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => write(structuredClone(sampleStored))}
              >
                Cargar ejemplo
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => write(structuredClone(emptyStored))}
              >
                Empezar de cero
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="sender">Nombre con el que firmas</Label>
              <Input
                id="sender"
                className="h-10"
                value={stored.sender}
                onChange={(event) => patch({ sender: event.target.value })}
                placeholder="Clara López"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="round">Qué ronda es</Label>
              <select
                id="round"
                className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={stored.round}
                onChange={(event) =>
                  patch({ round: event.target.value as ReminderRound })
                }
              >
                <option value="primera">Primera (amable)</option>
                <option value="segunda">Segunda (recordatorio)</option>
                <option value="ultima">Última (pedir fecha)</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="channel">Tono de canal</Label>
              <select
                id="channel"
                className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={stored.channel}
                onChange={(event) =>
                  patch({ channel: event.target.value as ReminderChannel })
                }
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Correo</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
          <h2 className="font-heading text-2xl">Quién te debe</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Una línea por persona:{" "}
            <span className="text-foreground">
              empresa, importe, fecha, concepto, teléfono o correo
            </span>
            . Fecha, teléfono y correo son opcionales. Entiende 450, 1.200 y
            280 €.
          </p>
          <Textarea
            className="mt-4 min-h-48 font-mono text-sm"
            value={stored.list}
            onChange={(event) => patch({ list: event.target.value })}
            aria-label="Lista de impagos"
            placeholder={"Taller Sur, 450, 01/08/2026, web, 600111222"}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {debtors.length === 0
              ? "No hay líneas con nombre e importe."
              : `${debtors.length} recordatorio${debtors.length === 1 ? "" : "s"} · ${formatEuro(totalCents)} · máximo 40.`}
          </p>
        </section>

        {error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" className="h-11 px-5 self-start">
          {copied === "all" ? <Check /> : <Copy />}
          {copied === "all" ? "Tanda copiada" : "Copiar todos los mensajes"}
        </Button>
      </form>

      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
            <p className="font-heading text-2xl">No hay mensajes todavía</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Pega una línea con nombre e importe, o pulsa “Cargar ejemplo”.
              Ejemplo: Taller Sur, 450, 01/08/2026, web, 600111222.
            </p>
          </div>
        ) : (
          messages.map(({ debtor, subject, body }, index) => (
            <ReminderCard
              key={`${debtor.company}-${index}`}
              debtor={debtor}
              subject={subject}
              body={body}
              channel={stored.channel}
              copied={copied === String(index)}
              onCopy={() =>
                void copyOne(
                  String(index),
                  stored.channel === "email"
                    ? `Asunto: ${subject}\n\n${body}`
                    : body,
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function ReminderCard({
  debtor,
  subject,
  body,
  channel,
  copied,
  onCopy,
}: {
  debtor: Debtor;
  subject: string;
  body: string;
  channel: ReminderChannel;
  copied: boolean;
  onCopy: () => void;
}) {
  const wa = waLink(debtor.phone, body);
  const mail = mailLink(debtor.email, subject, body);

  return (
    <article className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl">{debtor.company}</h3>
          <p className="text-sm text-muted-foreground">
            {formatEuro(debtor.amount)}
            {debtor.concept ? ` · ${debtor.concept}` : ""}
            {debtor.dateLabel ? ` · ${debtor.dateLabel}` : ""}
            {debtor.phone ? ` · ${debtor.phone}` : ""}
            {debtor.email ? ` · ${debtor.email}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="outline" size="sm" onClick={onCopy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={wa} target="_blank" rel="noreferrer" />}
          >
            <MessageCircle />
            WhatsApp
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={mail} />}
          >
            <Mail />
            Correo
          </Button>
        </div>
      </div>
      {channel === "email" ? (
        <p className="mt-3 text-sm">
          <span className="text-muted-foreground">Asunto: </span>
          {subject}
        </p>
      ) : null}
      <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
        {body}
      </pre>
    </article>
  );
}
