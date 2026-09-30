"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAccount, logoutAccount } from "@/lib/auth";
import { refreshProfile } from "@/lib/cloud";
import { LEGAL } from "@/lib/site";
import { useProfile } from "@/lib/use-consent";
import { useSession } from "@/lib/use-session";

/** Puerta del panel en modo nube: sesión de Supabase + perfil con is_admin. */
export function CloudGate({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const profile = useProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkedFor, setCheckedFor] = useState("");
  const accountId = session?.accountId ?? "";
  const checked = accountId !== "" && checkedFor === accountId;

  useEffect(() => {
    if (!accountId) return;
    let alive = true;
    refreshProfile().finally(() => {
      if (alive) setCheckedFor(accountId);
    });
    return () => {
      alive = false;
    };
  }, [accountId]);

  if (session && profile?.is_admin) return <>{children}</>;

  if (session) {
    return (
      <div className="mx-auto mt-8 max-w-md rounded-[2px] border-2 border-foreground bg-card p-6">
        <p className="font-heading text-2xl">
          {checked ? "Esta cuenta no es administradora." : "Comprobando permisos…"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {checked ? (
            <>
              Has entrado como <strong>{session.email}</strong>. Solo los correos de la lista de
              administradores (tabla <code>admin_allowlist</code> en Supabase) abren el panel.
              El tuyo debería ser {LEGAL.email}.
            </>
          ) : (
            "Un segundo."
          )}
        </p>
        {checked ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Button className="h-11" onClick={() => void refreshProfile()}>
              Volver a comprobar
            </Button>
            <Button variant="outline" className="h-11" onClick={() => logoutAccount()}>
              Salir y entrar con otra cuenta
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await loginAccount({ email, password });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo entrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="mx-auto mt-8 max-w-md rounded-[2px] border-2 border-foreground bg-card p-6"
    >
      <p className="font-heading text-2xl">Abrir el panel</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Entra con tu cuenta de administrador. Es la misma cuenta que cualquier usuario, pero
        con permiso de administración en la base de datos.
      </p>
      <div className="mt-5 grid gap-1.5">
        <Label htmlFor="admin-email">Correo</Label>
        <Input
          id="admin-email"
          type="email"
          className="h-12"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div className="mt-3 grid gap-1.5">
        <Label htmlFor="admin-password">Contraseña</Label>
        <Input
          id="admin-password"
          type="password"
          className="h-12"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="mt-5 h-12 w-full" disabled={busy}>
        {busy ? "Un momento…" : "Entrar al panel"}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        ¿Aún no tienes cuenta con {LEGAL.email}? Créala en /entrar y entrará como administrador
        automáticamente.
      </p>
    </form>
  );
}
