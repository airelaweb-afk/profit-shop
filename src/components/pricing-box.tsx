"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activatePro, deactivatePro } from "@/lib/pro";
import { LEGAL } from "@/lib/site";
import { usePro } from "@/lib/use-consent";

export function PricingBox() {
  const pro = usePro();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      activatePro(code);
      setNotice("Pro activo en este navegador. Sin anuncios aquí.");
      setCode("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo activar.");
    }
  }

  if (pro) {
    return (
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="font-heading text-2xl">Pro está activo aquí.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Solo en este aparato. Si borras los datos del sitio, hay que
          introducir la clave otra vez.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-11"
          onClick={() => deactivatePro()}
        >
          Quitar Pro de este navegador
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
    >
      <p className="font-heading text-2xl">Activar Pro</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Pagas fuera (Bizum o transferencia a {LEGAL.email}). Te enviamos una
        clave. Vive en este navegador, como la cuenta. Stripe, cuando esté,
        sustituye este paso.
      </p>
      <div className="mt-4 grid gap-1.5">
        <Label htmlFor="pro-code">Clave</Label>
        <Input
          id="pro-code"
          className="h-12"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoCapitalize="characters"
          autoComplete="off"
          required
        />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : null}
      {notice ? (
        <p className="mt-3 text-sm text-muted-foreground">{notice}</p>
      ) : null}
      <Button type="submit" className="mt-4 h-12 w-full sm:w-auto">
        Activar en este navegador
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        ¿Dudas? <Link href="/contacto/">Contacto</Link>.
      </p>
    </form>
  );
}
