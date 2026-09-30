import Link from "next/link";
import { Button } from "@/components/ui/button";

export function QueryLanding({
  kicker,
  title,
  lead,
  ctaHref,
  ctaLabel,
  points,
}: {
  kicker: string;
  title: string;
  lead: string;
  ctaHref: string;
  ctaLabel: string;
  points: string[];
}) {
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">{kicker}</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{lead}</p>
      <ul className="mt-8 space-y-3 text-sm">
        {points.map((point) => (
          <li
            key={point}
            className="border-l-4 border-primary bg-card py-3 pl-4"
          >
            {point}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button className="h-12" render={<Link href={ctaHref} />} nativeButton={false}>
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
}
