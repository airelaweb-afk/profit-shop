import { EnHome } from "@/components/en-home";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Free PDF and image tools in your browser, files stay on your device",
  description:
    "Merge PDFs, compress files, remove image backgrounds, convert HEIC to JPG and shrink photos. Free, in your browser, and the file is never uploaded.",
  path: "/en",
  keywords: [
    "merge pdf",
    "compress pdf",
    "remove background",
    "heic to jpg",
    "compress image",
    "free pdf tools",
  ],
  locale: "en",
});

export default function Page() {
  return <EnHome />;
}
