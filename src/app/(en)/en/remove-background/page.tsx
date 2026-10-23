import { EnToolPage } from "@/components/en-tool-page";
import { RemoveBackgroundTool } from "@/components/remove-background-tool";
import { enRemoveBackground } from "@/lib/en-copy";
import { pageMeta } from "@/lib/seo";

const copy = enRemoveBackground;

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
      <RemoveBackgroundTool locale="en" />
    </EnToolPage>
  );
}
