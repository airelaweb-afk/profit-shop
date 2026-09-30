import Link from "next/link";
import { ConsentControls } from "@/components/consent-controls";
import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL } from "@/lib/site";

export const metadata = legalMeta(
  "Cookies",
  "Política de cookies de Luna Oficio: almacenamiento local necesario y publicidad opcional.",
  "/cookies",
);

export default function CookiesPage() {
  return (
    <LegalShell kicker="Legal" title="Política de cookies">
      <p>Última actualización: {LEGAL.updated}.</p>
      <h2>Qué usamos</h2>
      <p>
        No usamos cookies clásicas de sesión de servidor. Usamos almacenamiento
        local de tu navegador:
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong className="text-foreground">Necesarias:</strong> cuenta,
          sesión, consentimiento, clave Pro. Sin ellas la web no recuerda que
          has entrado.
        </li>
        <li>
          <strong className="text-foreground">Publicidad (opcional):</strong>{" "}
          solo si pulsas “Aceptar publicidad”. Servirá para anuncios de
          terceros cuando estén activos. Hoy el hueco de anuncio es nuestro
          (Pro), no Google.
        </li>
      </ul>
      <h2>Cómo cambiarlo</h2>
      <p>
        Puedes cambiarlo aquí mismo, sin borrar la cuenta. La decisión se
        guarda en este navegador. Correo: {LEGAL.email}.
      </p>
      <ConsentControls />
      <p>
        Privacidad: <Link href="/privacidad/">política de privacidad</Link>.
      </p>
    </LegalShell>
  );
}
