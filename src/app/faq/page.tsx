import { FaqJsonLd, FaqList } from "@/components/faq-list";
import { siteFaqs } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Preguntas frecuentes",
  description:
    "¿Se suben los PDF? ¿Hay PDF a Word? ¿Qué es Pro? Respuestas de Luna Oficio: archivos en el navegador, ads y cuenta local.",
  path: "/faq",
  keywords: ["unir pdf seguro", "pdf a word", "luna oficio preguntas"],
});

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <FaqJsonLd items={siteFaqs} />
      <p className="text-sm tracking-wide text-primary uppercase">FAQ</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Lo que se pregunta antes de unir un PDF.
      </h1>
      <p className="mt-3 text-muted-foreground">
        Datos en el navegador, lo que no hacemos (PDF a Word, Cl@ve) y cómo se
        paga Pro.
      </p>
      <FaqList items={siteFaqs} title="Preguntas" />
    </div>
  );
}
