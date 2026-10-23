import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("heic");

export default function Page() {
  return <ImageKitPage kind="heic" />;
}
