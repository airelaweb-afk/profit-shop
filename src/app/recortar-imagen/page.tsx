import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("crop");

export default function Page() {
  return <ImageKitPage kind="crop" />;
}
