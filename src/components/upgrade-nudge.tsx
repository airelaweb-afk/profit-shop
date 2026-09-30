"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";

export function UpgradeNudge({
  reason,
  compact,
}: {
  reason: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "mt-4 rounded-[2px] border-2 border-primary bg-card p-4"
          : "mt-4 rounded-[2px] border-2 border-primary bg-accent p-4 text-accent-foreground"
      }
    >
      <p className="font-heading text-lg">{reason}</p>
      <p className={`mt-1 text-sm ${compact ? "text-muted-foreground" : ""}`}>
        Pro quita los límites: {PRO_MONTHLY} al mes o {PRO_YEARLY} al año.
      </p>
      <Button
        className={`mt-3 h-11 ${compact ? "" : "border-2 border-foreground bg-foreground text-background hover:bg-foreground/90"}`}
        render={<Link href="/precios/" />}
        nativeButton={false}
      >
        Ver Pro
      </Button>
    </div>
  );
}

export function FreeCapNote({ text }: { text: string }) {
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      {text}{" "}
      <Link href="/precios/" className="text-primary underline-offset-4 hover:underline">
        Pro, sin límite
      </Link>
      .
    </p>
  );
}
