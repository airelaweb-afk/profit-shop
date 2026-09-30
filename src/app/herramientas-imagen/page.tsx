import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { audioKit, imageKit, imageProKit } from "@/lib/image-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Herramientas de imagen",
  description:
    "Comprimir imagen, HEIC a JPG, PNG a JPG, JPG a WebP, recortar y girar. WebP en lote y plugin WordPress para Pro. En el navegador, sin subir el archivo.",
  path: "/herramientas-imagen",
  keywords: ["comprimir imagen", "heic a jpg", "png a jpg", "recortar imagen"],
});

export default function HerramientasImagenPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Imagen</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Comprimir, convertir, recortar. En este aparato.
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Lo que más se pide: que la foto pese menos, que el HEIC del iPhone se
        abra en Windows, que el PNG sea JPG o WebP. Para webs, la conversión a
        WebP en lote y el plugin de WordPress son Pro. Quitar fondo, ampliar
        con IA y vídeo no están: piden servidor.
      </p>
      <AdSlot label="Comprimir y HEIC a JPG son gratis." wrapClassName="mt-6" />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...imageKit, ...imageProKit, ...audioKit].map((tool) => (
          <li key={tool.href}>
            <ToolCard
              href={tool.href}
              name={tool.name}
              problem={tool.problem}
              does={tool.does}
              pro={"pro" in tool && tool.pro}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
