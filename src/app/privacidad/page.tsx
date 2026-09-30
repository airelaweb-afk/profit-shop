import Link from "next/link";
import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL, SITE_NAME } from "@/lib/site";

export const metadata = legalMeta(
  "Privacidad",
  "Política de privacidad de Luna Oficio: la cuenta y los archivos se quedan en tu navegador. Sin servidor nuestro de usuarios.",
  "/privacidad",
);

export default function PrivacidadPage() {
  return (
    <LegalShell kicker="Legal" title="Política de privacidad">
      <p>Última actualización: {LEGAL.updated}.</p>
      <h2>Responsable</h2>
      <p>
        {LEGAL.holder} · {LEGAL.email} · NIF {LEGAL.nif}.
      </p>
      <h2>Qué datos hay y dónde</h2>
      <p>
        {SITE_NAME} no tiene base de datos nuestra. La cuenta (nombre, correo y
        un hash de la contraseña con PBKDF2) se guarda en{" "}
        <strong className="text-foreground">este navegador</strong>{" "}
        (localStorage). Los PDF, fotos y presupuestos se procesan aquí y se
        descargan aquí. Si borras los datos del sitio o cambias de teléfono, se
        pierden. No hay “recuperar contraseña” en otro aparato.
      </p>
      <h2>Finalidad</h2>
      <p>
        Identificarte en este aparato para usar las herramientas y, si aceptas
        publicidad, mostrarte anuncios. Base jurídica: tu consentimiento y la
        ejecución del servicio que pides al usar la web (RGPD art. 6.1.a y b).
      </p>
      <h2>Cesiones</h2>
      <p>
        No vendemos listados. Si activas publicidad de terceros (cuando haya
        AdSense u otro), esos proveedores pueden tratar identificadores según
        su política. Hasta entonces no cargamos scripts de anuncios externos.
      </p>
      <h2>Derechos</h2>
      <p>
        Acceso, rectificación, supresión, oposición, limitación y portabilidad:
        escríbenos a {LEGAL.email}. En la práctica, borrar los datos del sitio
        en tu navegador los elimina de este aparato. Reclama ante la AEPD si lo
        consideras.
      </p>
      <h2>Menores</h2>
      <p>El sitio no está dirigido a menores de 14 años.</p>
      <p>
        Más detalle de cookies en la{" "}
        <Link href="/cookies/">política de cookies</Link>.
      </p>
    </LegalShell>
  );
}
