import { ComparePage, compareMetadata } from "@/components/compare-page";

export const metadata = compareMetadata("pdf-candy");

export default function Page() {
  return <ComparePage slug="pdf-candy" />;
}
