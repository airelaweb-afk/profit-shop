import { pdfKitMetadata, PdfKitPage } from "@/components/pdf-kit-page";

export const metadata = pdfKitMetadata("split");

export default function Page() {
  return <PdfKitPage kind="split" />;
}
