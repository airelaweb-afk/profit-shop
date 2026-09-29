"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAccount, registerAccount } from "@/lib/auth";
import { safeNextPath } from "@/lib/safe-next";
import { useSession } from "@/lib/use-session";

function nextPath() {
  if (typeof window === "undefined") return "/pdf/";
  const params = new URLSearchParams(window.location.search);
  return safeNextPath(params.get("next"));
}

function useUrlTab() {
  return useSyncExternalStore(
    () => () => {},
    () =>
      new URLSearchParams(window.location.search).get("tab") === "crear"
        ? "crear"
        : "entrar",
    () => "entrar",
  );
}

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const urlTab = useUrlTab();
  const [tab, setTab] = useState<"entrar" | "crear" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const active = tab ?? urlTab;

  useEffect(() => {
    if (session) router.replace(nextPath());
  }, [session, router]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (active === "crear") {
        await registerAccount({ name, email, password });
      } else {
        await loginAccount({ email, password });
      }
      router.push(nextPath());
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo entrar.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={active === "entrar" ? "default" : "outline"}
          onClick={() => setTab("entrar")}
        >
          Entrar
        </Button>
        <Button
          type="button"
          variant={active === "crear" ? "default" : "outline"}
          onClick={() => setTab("crear")}
        >
          Crear cuenta
        </Button>
      </div>
      {active === "crear" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="auth-name">Nombre</Label>
          <Input
            id="auth-name"
            className="h-10"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            required
          />
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="auth-email">Correo</Label>
        <Input
          id="auth-email"
          type="email"
          className="h-10"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="auth-password">Contraseña</Label>
        <Input
          id="auth-password"
          type="password"
          className="h-10"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={active === "crear" ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </div>
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-11" disabled={busy}>
        {busy
          ? "Un momento…"
          : active === "crear"
            ? "Crear cuenta y entrar"
            : "Entrar"}
      </Button>
      <p className="text-sm text-muted-foreground">
        La cuenta vive en este navegador. No se envía a ningún servidor. Si
        cambias de ordenador o borras los datos del sitio, hay que crearla otra
        vez.
      </p>
    </form>
  );
}
