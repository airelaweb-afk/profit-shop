import { pdfExtraMetadata, PdfExtraPage } from "@/components/pdf-extra-page";

export const metadata = pdfExtraMetadata("numbers");

export default function Page() {
  return <PdfExtraPage kind="numbers" />;
}
