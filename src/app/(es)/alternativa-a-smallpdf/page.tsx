import { ComparePage, compareMetadata } from "@/components/compare-page";

export const metadata = compareMetadata("smallpdf");

export default function Page() {
  return <ComparePage slug="smallpdf" />;
}
