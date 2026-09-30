import { Suspense } from "react";
import { PricingBox } from "@/components/pricing-box";
import { LEGAL } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { hasCloud } from "@/lib/supabase";

const cloud = hasCloud();

export const metadata = pageMeta({
  title: "Precios",
  description:
    "Luna Oficio es gratis para unir PDF, comprimir y firmar. Pro (29 €/año): sin anuncios, marca de agua en PDF, WebP en lote y plugin de WordPress. Pago con Stripe o Revolut.",
  path: "/precios",
  keywords: ["luna oficio pro", "convertir webp en lote precio", "plugin wordpress webp precio"],
});

export default function PreciosPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Precios</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Gratis lo que más se busca. Pro para trabajar con webs.
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
            <li>Unir, dividir, comprimir, rotar, numerar y eliminar páginas PDF</li>
            <li>JPG ↔ PDF, firmar PDF</li>
            <li>Comprimir imagen, HEIC a JPG, JPG a WebP, recortar, girar</li>
            <li>Presupuestos, avisos de cobro, partes de horas y gastos en PDF</li>
            <li>Anuncios si aceptas publicidad</li>
          </ul>
        </li>
        <li className="rounded-[2px] bg-accent p-5 text-accent-foreground ring-1 ring-foreground/15">
          <p className="text-sm tracking-wide uppercase">Pro</p>
          <p className="mt-2 font-heading text-3xl">29 € / año</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{cloud ? "Sin anuncios en todos tus aparatos" : "Sin anuncios en este navegador"}</li>
            <li>WebP en lote: cientos de imágenes o una carpeta entera, con ancho máximo y zip</li>
            <li>Plugin de WordPress: toda la biblioteca de medios a WebP, miniaturas incluidas</li>
            <li>Marca de agua en PDF (BORRADOR, CONFIDENCIAL…)</li>
            <li>Pago con Stripe o Revolut</li>
            <li>{cloud ? `Se activa solo al pagar · ${LEGAL.email}` : `Clave local · ${LEGAL.email}`}</li>
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
