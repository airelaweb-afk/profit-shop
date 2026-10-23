import { ComparePage, compareMetadata } from "@/components/compare-page";

export const metadata = compareMetadata("adobe-acrobat");

export default function Page() {
  return <ComparePage slug="adobe-acrobat" />;
}
