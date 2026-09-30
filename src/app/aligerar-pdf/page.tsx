import { QueryLanding } from "@/components/query-landing";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Aligerar PDF",
  description:
    "Aligerar un PDF para que entre en el correo. Compresión en el navegador, sin Adobe y sin subir el archivo.",
  path: "/aligerar-pdf",
  keywords: ["aligerar pdf", "reducir peso pdf", "pdf demasiado pesado", "comprimir pdf"],
});

export default function AligerarPdfPage() {
  return (
    <QueryLanding
      kicker="Aligerar PDF · en este aparato"
      title="Aligerar un PDF para que Gmail lo trague."
      lead="El escaneo pesa 18 MB y el correo lo corta. Aligerar es comprimir: ligera (mantiene el texto) o fuerte (páginas como foto)."
      ctaHref="/comprimir-pdf"
      ctaLabel="Comprimir PDF"
      points={[
        "Ligera: reescribe el archivo. Si ya estaba bien hecho, casi no adelgaza.",
        "Fuerte: cada página pasa a imagen. Baja más, ya no seleccionas texto.",
        "El original no se envía a ningún servidor nuestro.",
      ]}
    />
  );
}
