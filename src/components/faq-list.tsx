import Link from "next/link";
import type { FaqItem } from "@/lib/faq";

export function FaqList({
  items,
  title = "Preguntas que se buscan",
}: {
  items: FaqItem[];
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className="font-heading text-2xl">{title}</h2>
      <dl className="mt-6 grid gap-4">
        {items.map((item) => (
          <div
            key={item.q}
            className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <dt className="font-heading text-lg text-foreground">{item.q}</dt>
            <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
            {item.href ? (
              <p className="mt-3">
                <Link
                  href={item.href}
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  Abrir la herramienta
                </Link>
              </p>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
