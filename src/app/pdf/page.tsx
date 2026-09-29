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
        Sube tu PDF. Rellénalo. Fírmalo.
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">
        Elige el archivo que te han mandado. Si trae cajas, las rellenas. Si no,
        pulsas en la hoja y escribes. Dibujas la firma y la pones donde va. Te
        lo descargas. El PDF no sale de este navegador. No es Cl@ve ni un
        certificado digital: es tu rúbrica, como en papel.
      </p>
      <div className="mt-10">
        <PdfSignTool />
      </div>
    </div>
  );
}
