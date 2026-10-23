import { QueryLanding } from "@/components/query-landing";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Combinar PDF",
  description:
    "Combinar varios PDF en un solo documento, en el navegador. Sin subir el archivo a internet.",
  path: "/combinar-pdf",
  keywords: ["combinar pdf", "combinar pdfs", "combinar archivos pdf", "unir pdf"],
});

export default function CombinarPdfPage() {
  return (
    <QueryLanding
      kicker="Combinar PDF · en este aparato"
      title="Combinar PDF sin mandarlos a la nube."
      lead="Combinar es unir: el orden de la lista es el orden del archivo final. El trabajo se hace en este aparato."
      ctaHref="/unir-pdf"
      ctaLabel="Combinar ahora"
      points={[
        "Hasta 15 PDF y 20 MB cada uno. Si son más, combina en tandas.",
        "Un PDF con contraseña no entra: quítala en el original.",
        "La cuenta vive en localStorage. Cambias de teléfono, la creas otra vez.",
      ]}
    />
  );
}
