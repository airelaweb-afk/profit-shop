import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { RelatedGuides } from "@/components/related-guides";
import { allPdfTools } from "@/lib/pdf-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Herramientas PDF",
  description:
    "Unir, dividir, comprimir, JPG a PDF, PDF a JPG, rellenar, editar texto, firmar, rotar, numerar y eliminar páginas. Marca de agua Pro. En el navegador, sin subir el archivo.",
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
        Las que más se buscan: unir, dividir, comprimir, JPG ↔ PDF. También
        rellenar campos, editar el texto de la página, firmar, rotar, numerar y
        eliminar páginas. La marca de
        agua es Pro. No convertimos a Word: en el navegador el resultado queda
        mal y no vamos a fingirlo. Los archivos no salen de aquí.
      </p>
      <AdSlot label="Unir y comprimir son gratis. Pro desbloquea la marca de agua." wrapClassName="mt-6" />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allPdfTools.map((tool) => (
          <li key={tool.href}>
            <ToolCard
              href={tool.href}
              name={tool.name}
              problem={tool.problem}
              does={tool.does}
              pro={"pro" in tool && tool.pro}
            />
          </li>
        ))}
      </ul>
      <RelatedGuides href="/herramientas-pdf" />
    </div>
  );
}
