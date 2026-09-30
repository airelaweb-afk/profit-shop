import { pdfExtraMetadata, PdfExtraPage } from "@/components/pdf-extra-page";

export const metadata = pdfExtraMetadata("remove");

export default function Page() {
  return <PdfExtraPage kind="remove" />;
}
