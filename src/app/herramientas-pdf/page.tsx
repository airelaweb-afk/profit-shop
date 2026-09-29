import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { pdfKit } from "@/lib/pdf-kit";

export const metadata: Metadata = {
  title: "Herramientas PDF",
  description:
    "Unir, dividir, comprimir, JPG a PDF, PDF a JPG y firmar. En el navegador, con cuenta, sin subir el archivo a un servidor.",
};

export default function HerramientasPdfPage() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm tracking-wide text-primary uppercase">
          PDF · con cuenta
        </p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          Unir, comprimir, pasar a foto. En este aparato.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Las que más se buscan: unir, dividir, comprimir, JPG ↔ PDF. Firmar
          también. No convertimos a Word: en el navegador el resultado queda mal
          y no merece mentir. Los archivos no salen de aquí.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pdfKit.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
              >
                <p className="font-heading text-xl">{tool.name}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {tool.problem}
                </p>
                <p className="mt-2 text-sm">{tool.does}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Abrir
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AuthGate>
  );
}
