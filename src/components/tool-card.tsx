import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ToolCard({
  href,
  name,
  problem,
  does,
  pro,
  kicker,
}: {
  href: string;
  name: string;
  problem?: string;
  does?: string;
  pro?: boolean;
  kicker?: string;
}) {
  return (
    <Link href={href} className="punch-card flex h-full flex-col p-5">
      {kicker ? (
        <p className="text-sm tracking-wide text-primary uppercase">{kicker}</p>
      ) : null}
      <p className="font-heading text-xl">
        {name}
        {pro ? (
          <span className="ml-2 text-sm font-sans tracking-wide text-primary uppercase">
            Pro
          </span>
        ) : null}
      </p>
      {problem ? (
        <p className="mt-3 text-sm text-muted-foreground">{problem}</p>
      ) : null}
      {does ? <p className="mt-2 text-sm">{does}</p> : null}
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
        Abrir
        <ArrowRight className="size-3.5" />
      </span>
    </Link>
  );
}
