import { pdfKitMetadata, PdfKitPage } from "@/components/pdf-kit-page";

export const metadata = pdfKitMetadata("compress");

export default function Page() {
  return <PdfKitPage kind="compress" />;
}
