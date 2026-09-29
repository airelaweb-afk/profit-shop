import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AuthGate } from "@/components/auth-gate";
import { audioKit, imageKit } from "@/lib/image-kit";

export const metadata: Metadata = {
  title: "Herramientas de imagen",
  description:
    "Comprimir, recortar, girar, PNG a JPG, HEIC a JPG. En el navegador, con cuenta. Sin quitar fondo ni IA.",
};

export default function HerramientasImagenPage() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm tracking-wide text-primary uppercase">
          Imagen · con cuenta
        </p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          Comprimir, convertir, recortar. En este aparato.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Lo que un despacho pide cada día: que la foto pese menos, que el
          iPhone se abra en Windows, que el PNG sea JPG. Quitar fondo, ampliar
          con IA, PDF a Word y vídeo quedan aparcados.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...imageKit, ...audioKit].map((tool) => (
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
