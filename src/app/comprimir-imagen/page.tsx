import { imageKitMetadata, ImageKitPage } from "@/components/image-kit-page";

export const metadata = imageKitMetadata("compress");

export default function Page() {
  return <ImageKitPage kind="compress" />;
}
