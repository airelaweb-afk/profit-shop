import { legalMeta, LegalShell } from "@/components/legal-shell";
import { LEGAL } from "@/lib/site";

export const metadata = legalMeta(
  "Contacto",
  "Contacto de Luna Oficio. Escríbenos por correo. No hay chat ni teléfono de soporte 24 h.",
  "/contacto",
);

export default function ContactoPage() {
  return (
    <LegalShell kicker="Contacto" title="Escríbenos">
      <p>
        Correo:{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Titular:{" "}
        {LEGAL.holder}.
      </p>
      <p>
        Para un PDF que no abre, di el tipo de archivo y si lleva contraseña.
        No envíes el PDF con datos personales si puedes evitarlo: el
        procesamiento es en tu navegador.
      </p>
      <p>
        Clave Pro o facturación: pon “Pro” en el asunto. NIF del titular:{" "}
        {LEGAL.nif}.
      </p>
    </LegalShell>
  );
}
