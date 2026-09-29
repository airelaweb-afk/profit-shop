import type { Metadata } from "next";
import { PdfSignTool } from "@/components/pdf-sign-tool";

export const metadata: Metadata = {
  title: "Rellenar y firmar PDF",
  description:
    "Rellena y firma un PDF en el navegador, gratis. El archivo no se sube a ningún servidor. Sin cuenta y sin Adobe.",
};

export default function PdfPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        Herramienta · sin CRM
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Rellenar y firmar un PDF, aquí mismo.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Abre el archivo que te han mandado, o una hoja en blanco. Escribes,
        pones la fecha y dibujas la firma. Te lo descargas. El PDF no sale de
        este navegador. No es una firma con certificado digital ni Cl@ve: es tu
        rúbrica, como en papel.
      </p>
      <div className="mt-10">
        <PdfSignTool />
      </div>
    </div>
  );
}
