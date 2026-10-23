import { EnToolPage } from "@/components/en-tool-page";
import { PdfKitTool } from "@/components/pdf-kit-tool";
import { enMergePdf } from "@/lib/en-copy";
import { pageMeta } from "@/lib/seo";

const copy = enMergePdf;

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
      <PdfKitTool kind="merge" locale="en" />
    </EnToolPage>
  );
}
