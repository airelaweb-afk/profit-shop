import Link from "next/link";
import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL, SITE_NAME } from "@/lib/site";
import { hasCloud } from "@/lib/supabase";

const cloud = hasCloud();

export const metadata = legalMeta(
  "Privacidad",
  cloud
    ? "Política de privacidad de Luna Oficio: la cuenta guarda solo correo, nombre y si tienes Pro (Supabase, UE). Los archivos nunca salen de tu navegador."
    : "Política de privacidad de Luna Oficio: la cuenta y los archivos se quedan en tu navegador. Sin servidor nuestro de usuarios.",
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
      {cloud ? (
        <>
          <p>
            <strong className="text-foreground">Los archivos no salen de tu navegador.</strong>{" "}
            Los PDF, fotos, audios y presupuestos se procesan y se descargan en tu
            aparato; ningún servidor nuestro los recibe.
          </p>
          <p>
            Si creas una cuenta, guardamos <strong className="text-foreground">correo, nombre,
            fecha de alta, último acceso</strong> y, si pagas Pro, el método, importe y periodo
            del cobro. La contraseña se guarda cifrada (hash). Estos datos están en{" "}
            <strong className="text-foreground">Supabase</strong> (Supabase Inc., servidores en la
            Unión Europea), que actúa como encargado del tratamiento con contrato conforme al
            RGPD. El pago con tarjeta lo procesa Stripe; nosotros no vemos ni guardamos el número
            de tarjeta.
          </p>
        </>
      ) : (
        <p>
          {SITE_NAME} no tiene base de datos nuestra. La cuenta (nombre, correo y
          un hash de la contraseña con PBKDF2) se guarda en{" "}
          <strong className="text-foreground">este navegador</strong>{" "}
          (localStorage). Los PDF, fotos y presupuestos se procesan aquí y se
          descargan aquí. Si borras los datos del sitio o cambias de teléfono, se
          pierden. No hay “recuperar contraseña” en otro aparato.
        </p>
      )}
      <h2>Finalidad</h2>
      <p>
        {cloud
          ? "Identificarte para usar las herramientas en cualquier aparato, activar y mantener tu Pro, atender tus solicitudes y, si aceptas publicidad, mostrarte anuncios. Base jurídica: ejecución del servicio que pides (RGPD art. 6.1.b) y tu consentimiento para la publicidad (art. 6.1.a). Conservamos la cuenta mientras esté activa y los datos de cobro el tiempo que exige la normativa fiscal."
          : "Identificarte en este aparato para usar las herramientas y, si aceptas publicidad, mostrarte anuncios. Base jurídica: tu consentimiento y la ejecución del servicio que pides al usar la web (RGPD art. 6.1.a y b)."}
      </p>
      <h2>Cesiones</h2>
      <p>
        No vendemos listados.
        {cloud
          ? " Encargados: Supabase (alojamiento de cuentas, UE) y Stripe (cobros). "
          : " "}
        Si activas publicidad de terceros (cuando haya AdSense u otro), esos proveedores pueden
        tratar identificadores según su política. Hasta entonces no cargamos scripts de anuncios
        externos.
      </p>
      <h2>Derechos</h2>
      <p>
        Acceso, rectificación, supresión, oposición, limitación y portabilidad:
        escríbenos a {LEGAL.email}.{" "}
        {cloud
          ? "Puedes cambiar tu nombre y contraseña en /cuenta; para borrar la cuenta entera, pídelo por correo y la eliminamos. "
          : "En la práctica, borrar los datos del sitio en tu navegador los elimina de este aparato. "}
        Reclama ante la AEPD si lo consideras.
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
