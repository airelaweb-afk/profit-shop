"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAdminAccess, unlockAdmin } from "@/lib/admin";

export function AdminGate({ hasAccess }: { hasAccess: boolean }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (hasAccess) {
        await unlockAdmin(password);
      } else {
        if (password !== confirm) throw new Error("Las dos contraseñas no coinciden.");
        await createAdminAccess(password);
      }
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
      <p className="font-heading text-2xl">
        {hasAccess ? "Abrir el panel" : "Crear el acceso de administrador"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {hasAccess
          ? "La contraseña del panel vive en este navegador. Se pide una vez por pestaña."
          : "Este panel es tuyo y vive en este navegador. La contraseña se guarda aquí con PBKDF2; no hay servidor que la recupere. Anótala."}
      </p>
      <div className="mt-5 grid gap-1.5">
        <Label htmlFor="admin-password">Contraseña</Label>
        <Input
          id="admin-password"
          type="password"
          className="h-12"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={hasAccess ? "current-password" : "new-password"}
          minLength={hasAccess ? undefined : 10}
          required
        />
      </div>
      {!hasAccess ? (
        <div className="mt-3 grid gap-1.5">
          <Label htmlFor="admin-confirm">Repite la contraseña</Label>
          <Input
            id="admin-confirm"
            type="password"
            className="h-12"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
          />
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="mt-5 h-12 w-full" disabled={busy}>
        {busy ? "Un momento…" : hasAccess ? "Entrar al panel" : "Crear acceso"}
      </Button>
    </form>
  );
}
