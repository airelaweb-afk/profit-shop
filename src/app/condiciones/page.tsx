import Link from "next/link";
import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL } from "@/lib/site";
import { hasCloud } from "@/lib/supabase";

const cloud = hasCloud();

export const metadata = legalMeta(
  "Condiciones",
  "Condiciones de uso de Luna Oficio: herramientas gratis, Pro (sin anuncios, marca de agua, WebP en lote, plugin WordPress), archivos en tu navegador.",
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
        <Link href="/privacidad/">privacidad</Link>.{" "}
        {cloud
          ? "La cuenta se guarda en nuestra base de datos (correo, nombre y estado Pro); los archivos que procesas nunca se suben. No hay SLA."
          : "La cuenta es local: no hay SLA ni copia de seguridad nuestra."}
      </p>
      <h2>Gratis y Pro</h2>
      <p>
        Las herramientas (unir PDF, comprimir, HEIC a JPG, etc.) se usan
        sin cuenta, con un tope de archivos y de tareas al día. Pro (7 € al
        mes o 40 € al año) quita esos límites y desbloquea la marca de agua,
        WebP en lote y el plugin de WordPress. El plugin se licencia bajo GPL v2 o posterior; puedes instalarlo
        en los WordPress que administres. El cobro es con Stripe (tarjeta) o
        Revolut.{" "}
        {cloud
          ? "Al pagar, Pro se activa en tu cuenta y vale en cualquier aparato en el que entres."
          : "Al pagar te enviamos una clave que activas en Precios; la clave vive en este aparato."}
        {" "}Ver <Link href="/precios/">Precios</Link>.
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
