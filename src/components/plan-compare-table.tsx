import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { planRows } from "@/lib/plan-compare";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";

function Cell({ value }: { value: string }) {
  if (value === "Sí") {
    return (
      <span className="inline-flex items-center gap-1 font-medium">
        <Check className="size-4 text-primary" strokeWidth={2.5} />
        Sí
      </span>
    );
  }
  if (value === "No") {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Minus className="size-4" />
        No
      </span>
    );
  }
  return <span>{value}</span>;
}

export function PlanCompareTable({
  showCta = true,
  embedded = false,
}: {
  showCta?: boolean;
  embedded?: boolean;
}) {
  return (
    <section
      className={
        embedded
          ? "mt-12"
          : "mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
      }
    >
      <p className="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
        Gratis y Pro
      </p>
      <h2 className="mt-2 max-w-3xl font-heading text-3xl sm:text-4xl">
        Lo que cambia si pagas. Lo que no.
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        Las herramientas se usan igual, sin cuenta. Pro quita el tope y abre
        tres extras.
      </p>
      <div className="mt-8 overflow-x-auto rounded-[2px] border-2 border-foreground/15 bg-card">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-foreground/15 bg-foreground text-background">
              <th className="px-4 py-3 font-heading text-base font-normal sm:px-5">
                Qué incluye
              </th>
              <th className="px-4 py-3 font-heading text-base font-normal sm:px-5">
                Gratis
              </th>
              <th className="px-4 py-3 font-heading text-base font-normal sm:px-5">
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {planRows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-foreground/10 last:border-0"
              >
                <th className="px-4 py-3 font-medium sm:px-5">{row.label}</th>
                <td className="px-4 py-3 text-muted-foreground sm:px-5">
                  <Cell value={row.free} />
                </td>
                <td className="px-4 py-3 sm:px-5">
                  <Cell value={row.pro} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCta ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            className="h-11"
            render={<Link href="/precios" />}
            nativeButton={false}
          >
            Cómo se paga
          </Button>
          <p className="text-sm text-muted-foreground">
            {PRO_MONTHLY} al mes o {PRO_YEARLY} al año. Cancela cuando quieras.
          </p>
        </div>
      ) : null}
    </section>
  );
}
