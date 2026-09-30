import Link from "next/link";
import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL } from "@/lib/site";

export const metadata = legalMeta(
  "Condiciones",
  "Condiciones de uso de Luna Oficio: herramientas gratis, Pro sin anuncios y marca de agua, datos en tu navegador.",
  "/condiciones",
);

export default function CondicionesPage() {
  return (
    <LegalShell kicker="Legal" title="Condiciones de uso">
      <p>Última actualización: {LEGAL.updated}.</p>
      <h2>Cuenta</h2>
      <p>
        Al crear cuenta aceptas estas condiciones, el{" "}
        <Link href="/aviso-legal/">aviso legal</Link> y la{" "}
        <Link href="/privacidad/">privacidad</Link>. La cuenta es local: no hay
        SLA ni copia de seguridad nuestra.
      </p>
      <h2>Gratis y Pro</h2>
      <p>
        Las herramientas de búsqueda (unir PDF, comprimir, HEIC a JPG, etc.)
        son gratis, con anuncios si aceptas cookies de publicidad. Pro quita
        anuncios en este navegador y desbloquea la marca de agua en PDF. El
        cobro es con Stripe (tarjeta) o Revolut; al pagar te enviamos una clave
        que activas en{" "}
        <Link href="/precios/">Precios</Link>. La clave vive en este aparato.
      </p>
      <h2>Uso prohibido</h2>
      <p>
        No uses el sitio para material ilegal, para atacar sistemas ajenos ni
        para suplantar certificados oficiales. No es una firma electrónica
        cualificada.
      </p>
      <h2>Herramientas aparcadas</h2>
      <p>
        PDF a Word, vídeo, MP3 de salida y quitar fondo con IA no están. No se
        cobran. Si un día se montan con servidor, se avisará que el archivo
        viaja.
      </p>
    </LegalShell>
  );
}
