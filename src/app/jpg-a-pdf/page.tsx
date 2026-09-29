import { pdfKitMetadata, PdfKitPage } from "@/components/pdf-kit-page";

export const metadata = pdfKitMetadata("images");

export default function Page() {
  return <PdfKitPage kind="images" />;
}
