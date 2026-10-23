"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";

export function UpgradeNudge({
  reason,
  compact,
  locale = "es",
}: {
  reason: string;
  compact?: boolean;
  locale?: "es" | "en";
}) {
  const english = locale === "en";
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
        {english
          ? `Pro removes the limits: ${PRO_MONTHLY} a month or ${PRO_YEARLY} a year.`
          : `Pro quita los límites: ${PRO_MONTHLY} al mes o ${PRO_YEARLY} al año.`}
      </p>
      <Button
        className={`mt-3 h-11 ${compact ? "" : "border-2 border-foreground bg-foreground text-background hover:bg-foreground/90"}`}
        render={<Link href="/precios/" />}
        nativeButton={false}
      >
        {english ? "See Pro" : "Ver Pro"}
      </Button>
    </div>
  );
}

export function FreeCapNote({
  text,
  locale = "es",
}: {
  text: string;
  locale?: "es" | "en";
}) {
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      {text}{" "}
      <Link href="/precios/" className="text-primary underline-offset-4 hover:underline">
        {locale === "en" ? "Pro, no limit" : "Pro, sin límite"}
      </Link>
      .
    </p>
  );
}
