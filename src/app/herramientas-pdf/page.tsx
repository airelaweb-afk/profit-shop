import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AdSlot } from "@/components/ad-slot";
import { RelatedGuides } from "@/components/related-guides";
import { allPdfTools } from "@/lib/pdf-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Herramientas PDF",
  description:
    "Unir, dividir, comprimir, JPG a PDF, PDF a JPG, firmar, rotar y numerar. Marca de agua Pro. En el navegador, sin subir el archivo.",
  path: "/herramientas-pdf",
  keywords: ["herramientas pdf", "unir pdf", "comprimir pdf", "firmar pdf"],
});

export default function HerramientasPdfPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">PDF</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Unir, comprimir, firmar. En este aparato.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Las que más se buscan: unir, dividir, comprimir, JPG ↔ PDF. Firmar,
        rotar y numerar también. Marca de agua es Pro. No convertimos a Word:
        en el navegador el resultado queda mal y no merece mentir. Los archivos
        no salen de aquí.
      </p>
      <div className="mt-6">
        <AdSlot label="Unir y comprimir son gratis. Pro desbloquea la marca de agua." />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allPdfTools.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
            >
              <p className="font-heading text-xl">
                {tool.name}
                {"pro" in tool && tool.pro ? (
                  <span className="ml-2 text-sm font-sans tracking-wide text-primary uppercase">
                    Pro
                  </span>
                ) : null}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{tool.problem}</p>
              <p className="mt-2 text-sm">{tool.does}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                Abrir
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <RelatedGuides href="/herramientas-pdf" />
    </div>
  );
}
