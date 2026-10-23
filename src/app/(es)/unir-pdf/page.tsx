import { pdfKitMetadata, PdfKitPage } from "@/components/pdf-kit-page";

export const metadata = pdfKitMetadata("merge");

export default function Page() {
  return <PdfKitPage kind="merge" />;
}
