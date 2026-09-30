import { QueryLanding } from "@/components/query-landing";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Juntar PDF",
  description:
    "Juntar varios PDF en uno solo, en el navegador. Sin subir el archivo. Lo mismo que unir: eliges el orden y te bajas el resultado.",
  path: "/juntar-pdf",
  keywords: ["juntar pdf", "juntar pdfs", "juntar varios pdf", "unir pdf"],
});

export default function JuntarPdfPage() {
  return (
    <QueryLanding
      kicker="Juntar PDF · en este aparato"
      title="Juntar PDF. Varios archivos, uno solo."
      lead="«Juntar PDF» es la misma prisa que «unir»: DNI, presupuesto y contrato en un archivo. Aquí se juntan en tu navegador. No viajan a un servidor nuestro."
      ctaHref="/unir-pdf"
      ctaLabel="Abrir Unir PDF"
      points={[
        "Elige dos o más PDF y ordénalos con las flechas.",
        "El resultado se descarga aquí. En el teléfono: Guardar en Archivos.",
        "No convertimos a Word: el .docx de un conversor online remaqueta mal las tablas.",
        "Hace falta una cuenta de este navegador, no una suscripción.",
      ]}
    />
  );
}
