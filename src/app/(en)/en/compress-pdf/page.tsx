import { EnToolPage } from "@/components/en-tool-page";
import { PdfKitTool } from "@/components/pdf-kit-tool";
import { enCompressPdf } from "@/lib/en-copy";
import { pageMeta } from "@/lib/seo";

const copy = enCompressPdf;

export const metadata = pageMeta({
  title: copy.metaTitle,
  description: copy.meta,
  path: copy.path,
  keywords: copy.keywords,
  locale: "en",
});

export default function Page() {
  return (
    <EnToolPage copy={copy}>
      <PdfKitTool kind="compress" locale="en" />
    </EnToolPage>
  );
}
