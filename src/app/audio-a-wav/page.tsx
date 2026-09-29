import type { Metadata } from "next";
import Link from "next/link";
import { AuthGate } from "@/components/auth-gate";
import { AudioKitTool } from "@/components/audio-kit-tool";
import { audioKit, imageKit } from "@/lib/image-kit";

export const metadata: Metadata = {
  title: "Audio a WAV",
  description:
    "Pasa MP3, M4A u OGG a WAV en el navegador. Sin subir el archivo. Codificar a MP3 queda aparcado.",
};

export default function Page() {
  return (
    <AuthGate>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-sm tracking-wide text-primary uppercase">
          Audio a WAV · con cuenta
        </p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
          MP3 o nota de voz, a WAV.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          El navegador ya sabe leer MP3 y M4A. El WAV sale aquí. Convertir a
          MP3 o sacar el audio de un vídeo queda aparcado: pide un motor gordo.
        </p>
        <div className="mt-10">
          <AudioKitTool kind="to-wav" />
        </div>
        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[audioKit[1], ...imageKit.slice(0, 5)].map((tool) => (
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
    </AuthGate>
  );
}
