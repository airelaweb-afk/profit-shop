import { ComparePage, compareMetadata } from "@/components/compare-page";

export const metadata = compareMetadata("pdf24");

export default function Page() {
  return <ComparePage slug="pdf24" />;
}
