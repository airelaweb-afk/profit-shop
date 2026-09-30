import { pdfExtraMetadata, PdfExtraPage } from "@/components/pdf-extra-page";

export const metadata = pdfExtraMetadata("watermark");

export default function Page() {
  return <PdfExtraPage kind="watermark" />;
}
