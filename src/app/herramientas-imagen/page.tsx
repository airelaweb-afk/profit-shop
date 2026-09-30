import { AdSlot } from "@/components/ad-slot";
import { ToolCard } from "@/components/tool-card";
import { audioKit, imageKit } from "@/lib/image-kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Herramientas de imagen",
  description:
    "Comprimir, recortar, girar, PNG a JPG, HEIC a JPG. En el navegador. Sin quitar fondo ni IA. El archivo no se sube.",
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
        Lo que un despacho pide cada día: que la foto pese menos, que el iPhone
        se abra en Windows, que el PNG sea JPG. Quitar fondo, ampliar con IA,
        PDF a Word y vídeo quedan aparcados.
      </p>
      <div className="mt-6">
        <AdSlot label="Comprimir y HEIC a JPG son gratis." />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...imageKit, ...audioKit].map((tool) => (
          <li key={tool.href}>
            <ToolCard
              href={tool.href}
              name={tool.name}
              problem={tool.problem}
              does={tool.does}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
