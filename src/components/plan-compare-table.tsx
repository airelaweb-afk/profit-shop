import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bytesLabel, FREE } from "@/lib/limits";
import { planRows } from "@/lib/plan-compare";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";

function Cell({ value, yes = "Sí", no = "No" }: { value: string; yes?: string; no?: string }) {
  if (value === "Sí" || value === "Yes") {
    return (
      <span className="inline-flex items-center gap-1 font-medium">
        <Check className="size-4 text-primary" strokeWidth={2.5} />
        {yes}
      </span>
    );
  }
  if (value === "No") {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Minus className="size-4" />
        {no}
      </span>
    );
  }
  return <span>{value}</span>;
}

const englishRows = [
  { label: "Account to use the tools", free: "Not required", pro: "Not required" },
  { label: "Ads", free: "None", pro: "None" },
  { label: "The file is uploaded to a server", free: "No", pro: "No" },
  { label: "Merge / compress PDF", free: `Up to ${FREE.pdfFiles} files and ${bytesLabel(FREE.pdfBytes)}`, pro: "No practical cap" },
  { label: "Images per batch", free: `${FREE.imageFiles} · ${bytesLabel(FREE.imageBytes)}`, pro: "No practical cap" },
  { label: "Tasks a day", free: `${FREE.jobsPerDay}`, pro: "Unlimited" },
  { label: "Fill the original PDF fields", free: "Yes", pro: "Yes" },
  { label: "Edit text on the page", free: "Yes, with an embedded font when there is a TTF", pro: "Yes" },
  { label: "OCR for scans (in the browser)", free: "Yes, page by page", pro: "Yes" },
  { label: "Sign and mark on top", free: "Yes", pro: "Yes" },
  { label: "PDF watermark", free: "No", pro: "Yes" },
  { label: "WebP batch (a folder)", free: "No", pro: "Yes" },
  { label: "WordPress WebP plugin", free: "No", pro: "Yes" },
  { label: "Price", free: "0 €", pro: `${PRO_MONTHLY}/month or ${PRO_YEARLY}/year` },
] as const;

export function PlanCompareTable({
  showCta = true,
  embedded = false,
  locale = "es",
}: {
  showCta?: boolean;
  embedded?: boolean;
  locale?: "es" | "en";
}) {
  const en = locale === "en";
  const rows = en ? englishRows : planRows;
  return (
    <section
      className={
        embedded
          ? "mt-12"
          : "mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
      }
    >
      <p className="font-mono text-[0.7rem] tracking-[0.18em] text-primary uppercase">
        {en ? "Free and Pro" : "Gratis y Pro"}
      </p>
      <h2 className="mt-2 max-w-3xl font-heading text-3xl sm:text-4xl">
        {en ? "What changes if you pay. What does not." : "Lo que cambia si pagas. Lo que no."}
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
        {en
          ? "The tools work the same way, without an account. Pro removes the cap and opens three extras."
          : "Las herramientas se usan igual, sin cuenta. Pro quita el tope y abre tres extras."}
      </p>
      <div className="mt-8 overflow-x-auto rounded-[2px] border-2 border-foreground/15 bg-card">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-foreground/15 bg-foreground text-background">
              <th className="px-4 py-3 font-heading text-base font-normal sm:px-5">
                {en ? "What is included" : "Qué incluye"}
              </th>
              <th className="px-4 py-3 font-heading text-base font-normal sm:px-5">
                {en ? "Free" : "Gratis"}
              </th>
              <th className="px-4 py-3 font-heading text-base font-normal sm:px-5">
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-foreground/10 last:border-0"
              >
                <th className="px-4 py-3 font-medium sm:px-5">{row.label}</th>
                <td className="px-4 py-3 text-muted-foreground sm:px-5">
                  <Cell value={row.free} yes={en ? "Yes" : "Sí"} no="No" />
                </td>
                <td className="px-4 py-3 sm:px-5">
                  <Cell value={row.pro} yes={en ? "Yes" : "Sí"} no="No" />
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
            render={<Link href={en ? "/en/pricing/" : "/precios"} />}
            nativeButton={false}
          >
            {en ? "How to pay" : "Cómo se paga"}
          </Button>
          <p className="text-sm text-muted-foreground">
            {en
              ? `${PRO_MONTHLY} a month or ${PRO_YEARLY} a year. Cancel when you want.`
              : `${PRO_MONTHLY} al mes o ${PRO_YEARLY} al año. Cancela cuando quieras.`}
          </p>
        </div>
      ) : null}
    </section>
  );
}
