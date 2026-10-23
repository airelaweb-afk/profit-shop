import { EnToolPage } from "@/components/en-tool-page";
import { ImageKitTool } from "@/components/image-kit-tool";
import { enCompressImage } from "@/lib/en-copy";
import { pageMeta } from "@/lib/seo";

const copy = enCompressImage;

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
      <ImageKitTool kind="compress" locale="en" />
    </EnToolPage>
  );
}
