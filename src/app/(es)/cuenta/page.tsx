import type { Metadata } from "next";
import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Tu cuenta de Luna Oficio: Pro, datos y contraseña.",
  robots: { index: false, follow: false },
};

export default function CuentaPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Cuenta</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Mi cuenta.
      </h1>
      <div className="mt-8">
        <AccountPanel />
      </div>
    </div>
  );
}
