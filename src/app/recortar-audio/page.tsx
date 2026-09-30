import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { AuthGate } from "@/components/auth-gate";
import { AudioKitTool } from "@/components/audio-kit-tool";
import { RelatedGuides } from "@/components/related-guides";
import { audioKit, imageKit } from "@/lib/image-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Recortar audio",
  description:
    "Recorta un MP3 o una nota de voz y descárgalo en WAV. En el navegador, sin subir el archivo.",
  path: "/recortar-audio",
  keywords: ["recortar audio", "cortar nota de voz", "recortar mp3"],
});

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">
        Recortar audio · con cuenta
      </p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Quédate con el trozo que vale.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Marcas inicio y fin. Sale un WAV. Extraer el audio de un MP4 no está.
      </p>
      <AdSlot label="Recortar es gratis." wrapClassName="mt-6" />
      <div className="mt-10">
        <AuthGate>
          <AudioKitTool kind="trim" />
        </AuthGate>
      </div>
      <RelatedGuides href="/recortar-audio" />
      <ul className="mt-14 grid gap-3 sm:grid-cols-2">
        {[audioKit[0], imageKit[0]].map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block rounded-2xl bg-card p-4 ring-1 ring-foreground/10 hover:bg-muted/40"
            >
              <p className="font-heading text-lg">{tool.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{tool.does}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
