import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("to-webp");

export default function Page() {
  return <ImageKitPage kind="to-webp" />;
}
