import { EnToolPage } from "@/components/en-tool-page";
import { ImageKitTool } from "@/components/image-kit-tool";
import { enHeic } from "@/lib/en-copy";
import { pageMeta } from "@/lib/seo";

const copy = enHeic;

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
      <ImageKitTool kind="heic" locale="en" />
    </EnToolPage>
  );
}
