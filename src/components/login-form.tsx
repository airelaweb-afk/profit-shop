"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAccount, registerAccount } from "@/lib/auth";
import { cloudForgotPassword } from "@/lib/cloud";
import { safeNextPath } from "@/lib/safe-next";
import { hasCloud } from "@/lib/supabase";
import { useSession } from "@/lib/use-session";

type Tab = "entrar" | "crear" | "recuperar";

function nextPath() {
  if (typeof window === "undefined") return "/pdf/";
  const params = new URLSearchParams(window.location.search);
  return safeNextPath(params.get("next"));
}

function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const tab: Tab = params.get("tab") === "crear" ? "crear" : "entrar";
  return `${tab}|${params.get("confirmado") === "1" ? "1" : "0"}`;
}

function useUrlState() {
  const raw = useSyncExternalStore(() => () => {}, readUrlState, () => "entrar|0");
  const [tab, confirmed] = raw.split("|");
  return { tab: tab as Tab, confirmed: confirmed === "1" };
}

export function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const url = useUrlState();
  const cloud = hasCloud();
  const [tab, setTab] = useState<Tab | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const active: Tab = tab ?? url.tab;

  useEffect(() => {
    if (session) router.replace(nextPath());
  }, [session, router]);

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
    setNotice("");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (active === "recuperar") {
        await cloudForgotPassword(email);
        setNotice(
          "Si ese correo tiene cuenta, te acaba de llegar un enlace para poner una contraseña nueva. Mira también en spam.",
        );
        return;
      }
      if (active === "crear") {
        const result = await registerAccount({ name, email, password });
        if (result.needsConfirmation) {
          setNotice(
            "Cuenta creada. Te hemos enviado un correo: pulsa el enlace para confirmarla y después entra aquí.",
          );
          setPassword("");
          setTab("entrar");
          return;
        }
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

  const submitLabel = busy
    ? "Un momento…"
    : active === "crear"
      ? "Crear cuenta y entrar"
      : active === "recuperar"
        ? "Enviarme el enlace"
        : "Entrar";

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          className="h-12"
          variant={active === "entrar" ? "default" : "outline"}
          onClick={() => switchTab("entrar")}
        >
          Entrar
        </Button>
        <Button
          type="button"
          className="h-12"
          variant={active === "crear" ? "default" : "outline"}
          onClick={() => switchTab("crear")}
        >
          Crear cuenta
        </Button>
      </div>

      {url.confirmed && active === "entrar" ? (
        <p className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
          Correo confirmado. Ya puedes entrar con tu contraseña.
        </p>
      ) : null}

      {active === "recuperar" ? (
        <p className="text-sm text-muted-foreground">
          Escribe el correo de tu cuenta y te mandamos un enlace para elegir
          otra contraseña.
        </p>
      ) : null}

      {active === "crear" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="auth-name">Nombre</Label>
          <Input
            id="auth-name"
            className="h-12"
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
          className="h-12"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>
      {active !== "recuperar" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="auth-password">Contraseña</Label>
          <Input
            id="auth-password"
            type="password"
            className="h-12"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={active === "crear" ? "new-password" : "current-password"}
            minLength={8}
            required
          />
        </div>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
          {notice}
        </p>
      ) : null}
      <Button type="submit" className="h-12" disabled={busy}>
        {submitLabel}
      </Button>

      {cloud ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          {active === "recuperar" ? (
            <button
              type="button"
              className="ink-link text-muted-foreground"
              onClick={() => switchTab("entrar")}
            >
              Volver a entrar
            </button>
          ) : (
            <button
              type="button"
              className="ink-link text-muted-foreground"
              onClick={() => switchTab("recuperar")}
            >
              ¿Has olvidado la contraseña?
            </button>
          )}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {cloud
          ? "Tu cuenta vale en cualquier teléfono u ordenador. Los PDF y las fotos que proceses siguen sin salir de tu navegador: en la cuenta solo guardamos tu nombre, tu correo y si tienes Pro."
          : "La cuenta vive en este navegador. No se envía a ningún servidor. Si cambias de teléfono u ordenador, o borras los datos del sitio, hay que crearla otra vez."}
      </p>
    </form>
  );
}
