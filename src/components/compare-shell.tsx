import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import type { Competitor } from "@/lib/comparisons";
import { competitors } from "@/lib/comparisons";
import { COMPARISON_DISCLAIMER, COMPARISON_LAW } from "@/lib/legal-ads";
import { SITE_NAME } from "@/lib/site";

export function CompareShell({ item }: { item: Competitor }) {
  const others = competitors.filter((entry) => entry.slug !== item.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: item.title,
    description: item.meta,
    inLanguage: "es-ES",
    isPartOf: { "@type": "WebSite", name: SITE_NAME },
    about: [
      { "@type": "SoftwareApplication", name: SITE_NAME },
      {
        "@type": "Brand",
        name: item.name,
        description: "Marca de terceros, citada para identificar al competidor.",
      },
    ],
  };
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="text-sm tracking-wide text-primary uppercase">
        {SITE_NAME} · comparativa objetiva
      </p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Unir PDF sin subirlo. No somos {item.name}.
      </h1>
      <p className="mt-4 rounded-[2px] bg-accent px-4 py-3 text-sm text-foreground">
        {item.holder} Esta página es de {SITE_NAME}. No usamos su logotipo ni
        su nombre como si fuéramos ellos. {COMPARISON_DISCLAIMER} Norma:{" "}
        {COMPARISON_LAW}
      </p>
      <p className="mt-4 text-muted-foreground">
        Si has llegado buscando “{item.search}”, el atasco es el mismo. La
        diferencia objetiva: aquí el archivo se procesa en tu navegador. No
        viaja a un servidor nuestro. {item.name} trabaja en la nube o con
        software de escritorio: el archivo se sube o se instala.
      </p>
      <div className="mt-6">
        <AdSlot label="Unir y comprimir son gratis." />
      </div>
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-2 border-foreground text-sm">
          <thead className="bg-foreground text-background">
            <tr>
              <th className="px-3 py-3 text-left font-mono text-[0.65rem] tracking-widest uppercase">
                Hecho
              </th>
              <th className="px-3 py-3 text-left font-mono text-[0.65rem] tracking-widest uppercase">
                {SITE_NAME}
              </th>
              <th className="px-3 py-3 text-left font-mono text-[0.65rem] tracking-widest uppercase">
                {item.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {item.facts.map((row) => (
              <tr key={row.label} className="border-t border-foreground/20">
                <td className="px-3 py-3 font-medium">{row.label}</td>
                <td className="px-3 py-3">{row.ours}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.theirs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button className="h-12" render={<Link href="/unir-pdf" />} nativeButton={false}>
          Unir PDF ahora
        </Button>
        <Button
          variant="outline"
          className="h-12"
          render={<Link href="/comprimir-pdf" />}
          nativeButton={false}
        >
          Comprimir PDF
        </Button>
      </div>
      {others.length > 0 ? (
        <aside className="mt-14">
          <h2 className="font-heading text-2xl">Otras comparativas</h2>
          <ul className="mt-4 grid gap-2">
            {others.map((entry) => (
              <li key={entry.slug}>
                <Link href={entry.href} className="punch-card block p-4">
                  {SITE_NAME} frente a {entry.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </article>
  );
}
