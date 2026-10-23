import { ComparePage, compareMetadata } from "@/components/compare-page";

export const metadata = compareMetadata("iloveimg");

export default function Page() {
  return <ComparePage slug="iloveimg" />;
}
