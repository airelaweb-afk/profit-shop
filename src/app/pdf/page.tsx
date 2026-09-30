import { AdSlot } from "@/components/ad-slot";
import { AuthGate } from "@/components/auth-gate";
import { FaqList } from "@/components/faq-list";
import { PdfSignTool } from "@/components/pdf-sign-tool";
import { RelatedGuides } from "@/components/related-guides";
import { faqsForPath } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Rellenar y firmar PDF",
  description:
    "Rellena y firma un PDF en el navegador. Casillas, texto y rúbrica. El archivo no se sube a ningún servidor. No es Cl@ve.",
  path: "/pdf",
  keywords: ["firmar pdf", "rellenar pdf online", "firmar pdf movil"],
});

export default function PdfPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Firmar PDF · con cuenta
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Sube tu PDF. Rellénalo. Fírmalo.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Elige el archivo que te han mandado. Amplía la hoja, marca casillas,
        escribe y firma. Te lo descargas. El PDF no sale de este navegador. No
        es Cl@ve ni un certificado digital: es tu rúbrica, como en papel.
      </p>
      <div className="no-print mt-6">
        <AdSlot label="Firmar en el navegador es gratis. Pro quita los anuncios." />
      </div>
      <div className="mt-10">
        <AuthGate>
          <PdfSignTool />
        </AuthGate>
      </div>
      <div className="no-print">
        <FaqList items={faqsForPath("/pdf")} />
        <RelatedGuides href="/pdf" />
      </div>
    </div>
  );
}
