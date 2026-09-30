import { Suspense } from "react";
import { AdSlot } from "@/components/ad-slot";
import { FaqList } from "@/components/faq-list";
import { PdfEditTextTool } from "@/components/pdf-edit-text-tool";
import { RelatedGuides } from "@/components/related-guides";
import { faqsForPath } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Editar texto de un PDF en el navegador",
  description:
    "Cambia frases de un PDF que tiene capa de texto, sin subirlo. No es un formulario ni un escaneo. El archivo no sale de tu aparato.",
  path: "/editar-pdf",
  keywords: [
    "editar pdf",
    "editar texto pdf",
    "cambiar texto pdf online",
    "editar pdf sin adobe",
  ],
});

export default function EditarPdfPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Editar PDF · gratis
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Cambiar el texto que ya está en la página.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Como el «Editar texto» de iLove, pero aquí: el archivo no se sube. Hace
        falta que el PDF tenga letras de verdad (se puedan seleccionar). Un
        escaneo es una foto: eso no se edita, se pinta encima en Firmar PDF. Al
        guardar tapamos la frase vieja y escribimos la nueva; no rehacemos el
        diseño como Word.
      </p>
      <AdSlot label="Editar texto es gratis." wrapClassName="no-print mt-6" />
      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
          <PdfEditTextTool />
        </Suspense>
      </div>
      <div className="no-print">
        <FaqList items={faqsForPath("/editar-pdf")} />
        <RelatedGuides href="/editar-pdf" />
      </div>
    </div>
  );
}
