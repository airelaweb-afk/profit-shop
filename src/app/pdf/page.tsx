import type { Metadata } from "next";
import { AuthGate } from "@/components/auth-gate";
import { PdfSignTool } from "@/components/pdf-sign-tool";

export const metadata: Metadata = {
  title: "Rellenar y firmar PDF",
  description:
    "Rellena y firma un PDF en el navegador. Casillas, texto y rúbrica. El archivo no se sube a ningún servidor.",
};

export default function PdfPage() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="no-print text-sm tracking-wide text-primary uppercase">
          Herramienta · con cuenta
        </p>
        <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          Sube tu PDF. Rellénalo. Fírmalo.
        </h1>
        <p className="no-print mt-3 max-w-2xl text-muted-foreground">
          Elige el archivo que te han mandado. Amplía la hoja, marca casillas,
          escribe y firma. Te lo descargas. El PDF no sale de este navegador.
          No es Cl@ve ni un certificado digital: es tu rúbrica, como en papel.
        </p>
        <div className="mt-10">
          <PdfSignTool />
        </div>
      </div>
    </AuthGate>
  );
}
