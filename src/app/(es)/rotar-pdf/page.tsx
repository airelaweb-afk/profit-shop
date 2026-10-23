import { pdfExtraMetadata, PdfExtraPage } from "@/components/pdf-extra-page";

export const metadata = pdfExtraMetadata("rotate");

export default function Page() {
  return <PdfExtraPage kind="rotate" />;
}
