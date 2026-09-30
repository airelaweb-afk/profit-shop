"use client";

import { PricingBox } from "@/components/pricing-box";
import { usePro } from "@/lib/use-consent";

export function ProGate({
  children,
  pitch,
}: {
  children: React.ReactNode;
  pitch: string;
}) {
  const pro = usePro();
  if (pro) return <>{children}</>;
  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
        <p className="font-heading text-2xl">Esto es Pro</p>
        <p className="mt-2 text-sm text-muted-foreground">{pitch}</p>
      </div>
      <PricingBox />
    </div>
  );
}
