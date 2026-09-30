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
      <h2>Marcas de terceros y publicidad comparativa</h2>
      <p>
        El nombre de este sitio es {SITE_NAME}. No es el de otro conversor. En
        las páginas de comparativa citamos marcas ajenas (iLovePDF, Smallpdf,
        PDF24, iLoveIMG, Adobe Acrobat, Sejda, PDF Candy, entre otras) solo para
        identificar al competidor: no usamos su logotipo, no sugerimos
        afiliación y no presentamos nuestro servicio como imitación ni como
        producto llamado «Alternativa» más su marca.
      </p>
      <p>
        En España esa comparación es lícita si es objetiva, versa sobre
        características esenciales, pertinentes y verificables, no engaña, no
        denigra y no explota la reputación ajena: artículo 10 de la Ley 3/1991
        de Competencia Desleal (redacción de la Ley 29/2009), Directiva
        2006/114/CE, Ley 17/2001 de Marcas y, para el uso de marcas como
        palabra clave con justa causa al ofrecer una alternativa real, STS
        105/2016. El hecho que contrastamos es dónde se procesa el archivo
        (este navegador frente a un servidor ajeno).
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
