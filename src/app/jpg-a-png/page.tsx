import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("to-png");

export default function Page() {
  return <ImageKitPage kind="to-png" />;
}
