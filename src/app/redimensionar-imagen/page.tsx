import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("resize");

export default function Page() {
  return <ImageKitPage kind="resize" />;
}
