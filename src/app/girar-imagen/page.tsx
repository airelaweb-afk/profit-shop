import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("rotate");

export default function Page() {
  return <ImageKitPage kind="rotate" />;
}
