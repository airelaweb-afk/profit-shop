"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logoutAccount } from "@/lib/auth";
import {
  cloudUpdateName,
  cloudUpdatePassword,
  getRecoverySnapshot,
  myMemberships,
  refreshProfile,
  subscribeProfile,
} from "@/lib/cloud";
import { deactivatePro } from "@/lib/pro";
import { hasCloud, type MembershipRow } from "@/lib/supabase";
import { formatDateEs, formatEur, formatIsoEs } from "@/lib/use-admin";
import { usePro, useProfile, useProState } from "@/lib/use-consent";
import { useSession } from "@/lib/use-session";

function useHydrated() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

function useRecovery() {
  return useSyncExternalStore(subscribeProfile, getRecoverySnapshot, () => false);
}

function useUrlRecovery() {
  return useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get("recuperar") === "1",
    () => false,
  );
}

const METHOD_LABEL: Record<MembershipRow["method"], string> = {
  stripe: "Tarjeta (Stripe)",
  revolut: "Revolut",
  bizum: "Bizum",
  transferencia: "Transferencia",
  otro: "Otro",
};

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
      <h2 className="font-heading text-2xl">{title}</h2>
      <div className="mt-3 grid gap-3 text-sm">{children}</div>
    </section>
  );
}

function PasswordForm({ recovery }: { recovery: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);
    if (password !== confirm) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      await cloudUpdatePassword(password);
      setDone(true);
      setPassword("");
      setConfirm("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo cambiar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-3">
      {recovery ? (
        <p className="rounded-[2px] bg-accent px-3 py-2 text-accent-foreground">
          Has entrado desde el enlace de recuperación. Elige ahora tu contraseña nueva.
        </p>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="acc-password">Contraseña nueva</Label>
        <Input
          id="acc-password"
          type="password"
          className="h-11"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="acc-confirm">Repítela</Label>
        <Input
          id="acc-confirm"
          type="password"
          className="h-11"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      {error ? <p className="text-destructive">{error}</p> : null}
      {done ? <p className="text-muted-foreground">Contraseña cambiada.</p> : null}
      <Button type="submit" className="h-11 w-full sm:w-auto" disabled={busy}>
        {busy ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}

function NameForm({ initial }: { initial: string }) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);
    try {
      await cloudUpdateName(name);
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar.");
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-3 sm:flex sm:items-end">
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor="acc-name">Nombre</Label>
        <Input
          id="acc-name"
          className="h-11"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <Button type="submit" variant="outline" className="h-11">
        Guardar
      </Button>
      {error ? <p className="text-destructive">{error}</p> : null}
      {done ? <p className="text-muted-foreground">Guardado.</p> : null}
    </form>
  );
}

function CloudAccount() {
  const session = useSession();
  const profile = useProfile();
  const pro = usePro();
  const recovery = useRecovery();
  const urlRecovery = useUrlRecovery();
  const [memberships, setMemberships] = useState<MembershipRow[] | null>(null);

  const accountId = session?.accountId ?? "";
  useEffect(() => {
    if (!accountId) return;
    void refreshProfile();
    myMemberships()
      .then(setMemberships)
      .catch(() => setMemberships([]));
  }, [accountId]);

  if (!session) {
    return (
      <Box title="No has entrado.">
        <p className="text-muted-foreground">
          {urlRecovery
            ? "Abre el enlace de recuperación desde el mismo navegador donde lo pediste. Si ha caducado, pide otro."
            : "Entra o crea tu cuenta para ver tu Pro y tus datos."}
        </p>
        <div className="grid gap-2 sm:flex">
          <Button className="h-11" render={<Link href="/entrar/?next=%2Fcuenta%2F" />} nativeButton={false}>
            Entrar
          </Button>
          <Button
            variant="outline"
            className="h-11"
            render={<Link href="/entrar/?tab=crear&next=%2Fcuenta%2F" />}
            nativeButton={false}
          >
            Crear cuenta
          </Button>
        </div>
      </Box>
    );
  }

  const until = profile?.pro_until ? formatIsoEs(profile.pro_until) : null;

  return (
    <div className="grid gap-4">
      <Box title={pro ? "Pro activo en tu cuenta." : "Cuenta gratuita."}>
        {pro && until ? (
          <p>
            Sin anuncios y con todo desbloqueado hasta el <strong>{until}</strong>, en cualquier
            aparato donde entres con este correo.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Pro quita los límites y abre marca de agua, WebP en lote y el plugin por 7 €/mes o 40 €/año. Se activa
            solo al pagar con tu correo: <Link href="/precios/" className="ink-link">ver Pro</Link>.
          </p>
        )}
        {memberships && memberships.length > 0 ? (
          <ul className="divide-y divide-foreground/10 rounded-[2px] ring-1 ring-foreground/10">
            {memberships.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                <span>
                  {METHOD_LABEL[m.method]} · {formatEur(m.amount_cents / 100)}
                </span>
                <span className="text-muted-foreground">
                  {formatIsoEs(m.starts_at)} → {formatIsoEs(m.expires_at)}
                  {m.status !== "activo" ? ` · ${m.status}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </Box>

      <Box title="Tus datos">
        <p className="text-muted-foreground">
          Correo: <strong className="text-foreground">{session.email}</strong>
          {profile?.is_admin ? (
            <>
              {" "}· administrador ·{" "}
              <Link href="/admin/" className="ink-link">abrir el panel</Link>
            </>
          ) : null}
        </p>
        <NameForm key={profile?.name ?? session.name} initial={profile?.name ?? session.name} />
      </Box>

      <Box title="Contraseña">
        <PasswordForm recovery={recovery || urlRecovery} />
      </Box>

      <Box title="Salir">
        <p className="text-muted-foreground">
          Cierra la sesión en este aparato. Tus datos siguen en tu cuenta.
        </p>
        <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => logoutAccount()}>
          Cerrar sesión
        </Button>
      </Box>
    </div>
  );
}

function LocalAccount() {
  const session = useSession();
  const proState = useProState();
  const pro = usePro();

  if (!session) {
    return (
      <Box title="No has entrado.">
        <p className="text-muted-foreground">La cuenta vive en este navegador.</p>
        <Button className="h-11 w-full sm:w-auto" render={<Link href="/entrar/" />} nativeButton={false}>
          Entrar o crear cuenta
        </Button>
      </Box>
    );
  }

  return (
    <div className="grid gap-4">
      <Box title={pro ? "Pro activo en este navegador." : "Sin Pro en este navegador."}>
        {pro && proState ? (
          <p>
            Clave <span className="font-mono">{proState.serial}</span> válida hasta el{" "}
            {formatDateEs(proState.expires)}.
          </p>
        ) : (
          <p className="text-muted-foreground">
            <Link href="/precios/" className="ink-link">Ver Pro</Link> · 7 €/mes o 40 €/año.
          </p>
        )}
        {pro ? (
          <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => deactivatePro()}>
            Quitar Pro de este navegador
          </Button>
        ) : null}
      </Box>
      <Box title="Tus datos">
        <p>
          {session.name} · {session.email}
        </p>
        <p className="text-muted-foreground">
          Esta cuenta solo existe en este aparato. No hay servidor detrás.
        </p>
        <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => logoutAccount()}>
          Cerrar sesión
        </Button>
      </Box>
    </div>
  );
}

export function AccountPanel() {
  const ready = useHydrated();
  if (!ready) {
    return (
      <p className="rounded-[2px] bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/15">
        Cargando tu cuenta…
      </p>
    );
  }
  return hasCloud() ? <CloudAccount /> : <LocalAccount />;
}
