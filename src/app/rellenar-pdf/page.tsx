import { AdSlot } from "@/components/ad-slot";
import { FaqList } from "@/components/faq-list";
import { PdfFillTool } from "@/components/pdf-fill-tool";
import { RelatedGuides } from "@/components/related-guides";
import { faqsForPath } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Rellenar PDF: campos originales del formulario",
  description:
    "Rellena las casillas reales de un PDF (AcroForm) en el navegador. No pinta texto encima. El archivo no se sube. Si el PDF es un escaneo, no hay campos.",
  path: "/rellenar-pdf",
  keywords: [
    "rellenar pdf",
    "editar campos pdf",
    "formulario pdf online",
    "acroform rellenar",
  ],
});

export default function RellenarPdfPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Rellenar PDF · gratis
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Los campos de verdad. No texto encima.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Si el PDF nació con casillas, las ves y las rellenas en su sitio (las
        mismas que en Adobe). Un escaneo no tiene campos: no los inventamos.
        Para marcar encima, Firmar PDF.
      </p>
      <AdSlot label="Rellenar campos es gratis." wrapClassName="no-print mt-6" />
      <div className="mt-10">
        <PdfFillTool />
      </div>
      <div className="no-print">
        <FaqList items={faqsForPath("/rellenar-pdf")} />
        <RelatedGuides href="/rellenar-pdf" />
      </div>
    </div>
  );
}
