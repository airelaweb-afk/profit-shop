import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("cutout");

export default function Page() {
  return <ImageKitPage kind="cutout" />;
}
