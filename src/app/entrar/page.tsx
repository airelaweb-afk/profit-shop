import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Inicia sesión o crea una cuenta en este navegador para usar las herramientas de Luna Oficio.",
};

export default function EntrarPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Cuenta</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Entra para usar Luna Oficio.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Las herramientas (presupuestos, cobros, firmar PDF…) piden cuenta. Sin
        CRM: es solo para saber que eres tú, en este aparato.
      </p>
      <div className="mt-8 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <LoginForm />
      </div>
    </div>
  );
}
