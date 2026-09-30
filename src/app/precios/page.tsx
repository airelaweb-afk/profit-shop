import { Suspense } from "react";
import { PricingBox } from "@/components/pricing-box";
import { LEGAL } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { hasCloud } from "@/lib/supabase";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";
import { FREE } from "@/lib/limits";

const cloud = hasCloud();

export const metadata = pageMeta({
  title: "Precios: Pro 7 €/mes o 40 €/año",
  description:
    "Luna Oficio es gratis para unir PDF, comprimir y firmar, sin cuenta. Pro ilimitado: 7 € al mes o 40 € al año. Marca de agua, WebP en lote y plugin WordPress.",
  path: "/precios",
  keywords: ["luna oficio pro", "precio unir pdf ilimitado", "plugin wordpress webp precio"],
});

export default function PreciosPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Precios</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Gratis para el caso de hoy. Pro, sin límite.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Las herramientas se usan sin cuenta. El archivo no se sube. Pagas en
        Stripe (tarjeta) o Revolut.
      </p>
      <ul className="mt-10 grid gap-4 lg:grid-cols-3">
        <li className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide text-primary uppercase">Gratis</p>
          <p className="mt-2 font-heading text-3xl">0 €</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Sin cuenta</li>
            <li>Unir hasta {FREE.pdfFiles} PDF de {FREE.pdfBytes / (1024 * 1024)} MB</li>
            <li>Hasta {FREE.imageFiles} imágenes por tanda</li>
            <li>{FREE.jobsPerDay} tareas al día</li>
            <li>Firmar, comprimir, HEIC a JPG, JPG a WebP</li>
            <li>Presupuestos y documentos (tandas cortas)</li>
          </ul>
        </li>
        <li className="rounded-[2px] bg-card p-5 ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide text-primary uppercase">Pro mensual</p>
          <p className="mt-2 font-heading text-3xl">{PRO_MONTHLY}<span className="text-lg"> / mes</span></p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Sin límite de archivos ni de peso razonable</li>
            <li>Sin cupo diario</li>
            <li>Marca de agua en PDF</li>
            <li>WebP en lote (carpeta entera)</li>
            <li>Plugin WordPress WebP</li>
            <li>Cancela cuando quieras</li>
          </ul>
        </li>
        <li className="rounded-[2px] bg-accent p-5 text-accent-foreground ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide uppercase">Pro anual · el que sale a cuenta</p>
          <p className="mt-2 font-heading text-3xl">{PRO_YEARLY}<span className="text-lg"> / año</span></p>
          <p className="mt-1 text-sm">3,33 € al mes. Te ahorras 44 € frente a pagar mes a mes.</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Todo lo del mensual, 12 meses</li>
            <li>{cloud ? "Vale en todos tus aparatos" : "Clave en este navegador"}</li>
            <li>{cloud ? `Se activa al pagar · ${LEGAL.email}` : `Clave local · ${LEGAL.email}`}</li>
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
