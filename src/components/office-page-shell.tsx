import { AdSlot } from "@/components/ad-slot";
import { AuthGate } from "@/components/auth-gate";
import { RelatedGuides } from "@/components/related-guides";

export function OfficePageShell({
  kicker,
  title,
  lead,
  href,
  children,
}: {
  kicker: string;
  title: string;
  lead: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="no-print text-sm tracking-wide text-primary uppercase">
        {kicker}
      </p>
      <h1 className="no-print mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="no-print mt-3 max-w-2xl text-muted-foreground">{lead}</p>
      <div className="no-print mt-6">
        <AdSlot label="La herramienta es gratis. Pro quita los anuncios en este navegador." />
      </div>
      <div className="mt-10">
        <AuthGate>{children}</AuthGate>
      </div>
      <div className="no-print">
        <RelatedGuides href={href} />
      </div>
    </div>
  );
}
