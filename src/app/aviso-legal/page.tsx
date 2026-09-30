import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = legalMeta(
  "Aviso legal",
  "Aviso legal de Luna Oficio: titular, objeto del sitio y condiciones de uso de las herramientas en el navegador.",
  "/aviso-legal",
);

export default function AvisoLegalPage() {
  return (
    <LegalShell kicker="Legal" title="Aviso legal">
      <p>Última actualización: {LEGAL.updated}.</p>
      <h2>Titular</h2>
      <p>
        El sitio {SITE_NAME} ({SITE_URL}) lo edita {LEGAL.holder}. Correo:{" "}
        {LEGAL.email}. NIF: {LEGAL.nif}. Domicilio: {LEGAL.address}.
      </p>
      <h2>Objeto</h2>
      <p>
        Herramientas puntuales para autónomos y administración (unir PDF,
        comprimir imagen, presupuestos, cobros, etc.). No es un CRM, no es
        Cl@ve ni un certificado digital, no es software de facturación
        Verifactu.
      </p>
      <h2>Propiedad intelectual</h2>
      <p>
        Los textos, marcas y código de esta web son de {LEGAL.holder}, salvo
        las librerías de terceros con su propia licencia. Puedes usar las
        herramientas para tu trabajo. No puedes copiar el sitio entero y
        venderlo como propio.
      </p>
      <h2>Responsabilidad</h2>
      <p>
        Las herramientas se ofrecen “tal cual”. Un PDF protegido, un HEIC raro
        o un archivo corrupto pueden fallar. Revisa el archivo descargado antes
        de enviarlo a un cliente o a una sede. No respondemos de trámites
        administrativos mal presentados.
      </p>
      <h2>Ley aplicable</h2>
      <p>España. Fuero de los juzgados del domicilio del titular, cuando proceda.</p>
    </LegalShell>
  );
}
