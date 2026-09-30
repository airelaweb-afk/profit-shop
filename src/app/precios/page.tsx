import { Suspense } from "react";
import { PricingBox } from "@/components/pricing-box";
import { LEGAL } from "@/lib/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Precios",
  description:
    "Luna Oficio es gratis para unir PDF, comprimir y firmar. Pro (29 €/año) quita anuncios y desbloquea la marca de agua. Pago con Stripe o Revolut.",
  path: "/precios",
  keywords: ["luna oficio pro", "marca de agua pdf precio"],
});

export default function PreciosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Precios</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Gratis lo que se busca. Pro, sin anuncios y con marca de agua.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Pagas en Stripe (tarjeta) o en Revolut. Los archivos siguen en tu
        navegador: el cobro es en su web, no en un servidor nuestro.
      </p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        <li className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide text-primary uppercase">Gratis</p>
          <p className="mt-2 font-heading text-3xl">0 €</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Unir, dividir, comprimir, rotar y numerar PDF</li>
            <li>JPG ↔ PDF, firmar</li>
            <li>Comprimir imagen, HEIC a JPG, recortar</li>
            <li>Presupuestos, cobros, horas, gastos</li>
            <li>Anuncios si aceptas publicidad</li>
          </ul>
        </li>
        <li className="rounded-[2px] bg-accent p-5 text-accent-foreground ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide uppercase">Pro</p>
          <p className="mt-2 font-heading text-3xl">29 € / año</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Sin anuncios en este navegador</li>
            <li>Marca de agua en PDF (BORRADOR, CONFIDENCIAL…)</li>
            <li>Pago con Stripe o Revolut</li>
            <li>Clave local · {LEGAL.email}</li>
          </ul>
        </li>
      </ul>
      <div className="mt-8">
        <Suspense>
          <PricingBox />
        </Suspense>
      </div>
    </div>
  );
}
