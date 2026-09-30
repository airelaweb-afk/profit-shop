import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { AuthGate } from "@/components/auth-gate";
import { FaqList } from "@/components/faq-list";
import { PdfExtraTool } from "@/components/pdf-extra-tool";
import { ProGate } from "@/components/pro-gate";
import { RelatedGuides } from "@/components/related-guides";
import { faqsForPath } from "@/lib/faq";
import { allPdfTools, pdfExtraKit, type PdfExtraSlug } from "@/lib/pdf-kit";
import { pageMeta } from "@/lib/seo";

const copy: Record<
  PdfExtraSlug,
  {
    title: string;
    kicker: string;
    lead: string;
    metaTitle: string;
    meta: string;
    keywords: string[];
  }
> = {
  rotate: {
    metaTitle: "Rotar PDF",
    meta: "Gira un PDF 90, 180 o 270 grados en el navegador. Sin Adobe y sin subir el archivo.",
    keywords: ["rotar pdf", "girar pdf", "enderezar pdf"],
    kicker: "Rotar PDF · con cuenta",
    title: "El escaneo de lado, derecho.",
    lead: "Giras todas las páginas a la vez. 90, 180 o 270. El archivo no sale de este navegador.",
  },
  numbers: {
    metaTitle: "Numerar PDF",
    meta: "Añade el número de página al pie de un PDF en el navegador. Sin subir el archivo.",
    keywords: ["numerar pdf", "numero de pagina pdf"],
    kicker: "Numerar PDF · con cuenta",
    title: "Que cada hoja lleve su número.",
    lead: "Pone el dígito al pie, centrado. Puedes empezar en 1 o en otro número si es un anexo.",
  },
  watermark: {
    metaTitle: "Marca de agua PDF",
    meta: "Pon BORRADOR o CONFIDENCIAL en un PDF. Herramienta Pro. En el navegador, sin subir el archivo.",
    keywords: ["marca de agua pdf", "pdf borrador", "watermark pdf"],
    kicker: "Marca de agua · Pro",
    title: "BORRADOR, en cada hoja.",
    lead: "Texto en diagonal, el que tú escribas. Es Pro: 29 € al año en este navegador. Unir y comprimir siguen gratis.",
  },
};

export function pdfExtraMetadata(kind: PdfExtraSlug): Metadata {
  const item = copy[kind];
  const href = pdfExtraKit.find((tool) => tool.slug === kind)?.href ?? "/";
  return pageMeta({
    title: item.metaTitle,
    description: item.meta,
    path: href,
    keywords: item.keywords,
  });
}

export function PdfExtraPage({ kind }: { kind: PdfExtraSlug }) {
  const item = copy[kind];
  const href = pdfExtraKit.find((tool) => tool.slug === kind)?.href ?? "/";
  const others = allPdfTools.filter((tool) => tool.slug !== kind);
  const tool = (
    <AuthGate>
      {kind === "watermark" ? (
        <ProGate pitch="La marca de agua es de pago. Activas Pro en este navegador y el PDF sigue sin salir de aquí. Unir, comprimir y firmar no se tocan.">
          <PdfExtraTool kind={kind} />
        </ProGate>
      ) : (
        <PdfExtraTool kind={kind} />
      )}
    </AuthGate>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">{item.kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {item.title}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{item.lead}</p>
      <div className="mt-6">
        <AdSlot label="Unir y comprimir PDF siguen gratis, con o sin Pro." />
      </div>
      <div className="mt-10">{tool}</div>
      <FaqList items={faqsForPath(href)} />
      <RelatedGuides href={href} />
      <aside className="mt-14">
        <h2 className="font-heading text-2xl">Otras del mismo estilo</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="block punch-card p-4"
              >
                <p className="font-heading text-lg">{entry.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.does}</p>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
