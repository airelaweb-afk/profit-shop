import { pdfKitMetadata, PdfKitPage } from "@/components/pdf-kit-page";

export const metadata = pdfKitMetadata("to-images");

export default function Page() {
  return <PdfKitPage kind="to-images" />;
}
