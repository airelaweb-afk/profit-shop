import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AudioKitTool } from "@/components/audio-kit-tool";
import {
  EnCompareIndex,
  EnCompareOne,
  EnContactPage,
  EnFaqPage,
  EnHowPage,
  EnImageCatalog,
  EnLegal,
  EnPdfCatalog,
  EnPluginPage,
  EnPricingPage,
} from "@/components/en-articles";
import { EnToolPage } from "@/components/en-tool-page";
import { ExpenseTool } from "@/components/expense-tool";
import { ImageKitTool } from "@/components/image-kit-tool";
import { OfficePageShell } from "@/components/office-page-shell";
import { ProGate } from "@/components/pro-gate";
import { PdfEditTextTool } from "@/components/pdf-edit-text-tool";
import { PdfExtraTool } from "@/components/pdf-extra-tool";
import { PdfFillTool } from "@/components/pdf-fill-tool";
import { PdfKitTool } from "@/components/pdf-kit-tool";
import { PdfSignTool } from "@/components/pdf-sign-tool";
import { QuoteBatchTool } from "@/components/quote-batch-tool";
import { ReminderBatchTool } from "@/components/reminder-batch-tool";
import { TimesheetTool } from "@/components/timesheet-tool";
import { VersionQuoteTool } from "@/components/version-quote-tool";
import { WebpBatchTool } from "@/components/webp-batch-tool";
import { getEnPage, type EnPageSpec } from "@/lib/en-catalog";
import type { AudioKitSlug, ImageKitSlug } from "@/lib/image-kit";
import type { PdfExtraSlug, PdfKitSlug } from "@/lib/pdf-kit";

function ToolBody({ page }: { page: EnPageSpec }) {
  const copy = page.copy;
  if (!copy) return null;
  let tool = null;
  if (page.kind === "pdf") {
    tool = <PdfKitTool kind={page.tool as Exclude<PdfKitSlug, "sign" | "fill" | "edit">} locale="en" />;
  } else if (page.kind === "image") {
    tool = <ImageKitTool kind={page.tool as ImageKitSlug} locale="en" />;
  } else if (page.kind === "extra") {
    const extra = <PdfExtraTool kind={page.tool as PdfExtraSlug} locale="en" />;
    tool =
      page.tool === "watermark" ? (
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <ProGate
            locale="en"
            pitch="The watermark is paid. Turn Pro on and the PDF still stays here. Merge, compress and sign stay free."
          >
            {extra}
          </ProGate>
        </Suspense>
      ) : (
        extra
      );
  } else if (page.kind === "audio") {
    tool = <AudioKitTool kind={page.tool as AudioKitSlug} locale="en" />;
  } else if (page.kind === "sign") {
    tool = <PdfSignTool locale="en" />;
  } else if (page.kind === "fill") {
    tool = (
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <PdfFillTool locale="en" />
      </Suspense>
    );
  } else if (page.kind === "edit") {
    tool = (
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <PdfEditTextTool locale="en" />
      </Suspense>
    );
  } else if (page.kind === "webp") {
    tool = (
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ProGate
          locale="en"
          pitch="Batch conversion is Pro: 7 € a month or 40 € a year. It includes the WordPress plugin, the PDF watermark and no file cap. The images do not leave your browser."
        >
          <WebpBatchTool locale="en" />
        </ProGate>
      </Suspense>
    );
  } else if (
    page.kind === "quotes" ||
    page.kind === "versions" ||
    page.kind === "reminders" ||
    page.kind === "timesheet" ||
    page.kind === "expenses"
  ) {
    const inner =
      page.kind === "quotes" ? (
        <QuoteBatchTool locale="en" />
      ) : page.kind === "versions" ? (
        <VersionQuoteTool locale="en" />
      ) : page.kind === "reminders" ? (
        <ReminderBatchTool locale="en" />
      ) : page.kind === "timesheet" ? (
        <TimesheetTool locale="en" />
      ) : (
        <ExpenseTool locale="en" />
      );
    return (
      <OfficePageShell kicker={copy.kicker} title={`${copy.name}. ${copy.slogan}`} lead={copy.lead} href={page.es} showGuides={false}>
        {inner}
      </OfficePageShell>
    );
  }
  if (!tool) return null;
  return <EnToolPage copy={copy}>{tool}</EnToolPage>;
}

export function EnSlugPage({ slug }: { slug: string }) {
  const page = getEnPage(slug);
  if (!page) notFound();
  if (page.kind === "pdf-catalog") return <EnPdfCatalog />;
  if (page.kind === "image-catalog") return <EnImageCatalog />;
  if (page.kind === "faq") return <EnFaqPage />;
  if (page.kind === "pricing") return <EnPricingPage />;
  if (page.kind === "how") return <EnHowPage />;
  if (page.kind === "contact") return <EnContactPage />;
  if (page.kind === "compare") return <EnCompareIndex />;
  if (page.kind === "compare-one" && page.competitor) return <EnCompareOne slug={page.competitor} />;
  if (page.kind === "plugin") return <EnPluginPage />;
  if (
    page.kind === "legal-notice" ||
    page.kind === "privacy" ||
    page.kind === "cookies" ||
    page.kind === "terms"
  ) {
    return <EnLegal kind={page.kind} />;
  }
  return <ToolBody page={page} />;
}
