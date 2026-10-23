import Link from "next/link";
import { competitors } from "@/lib/comparisons";
import { COMPARISON_DISCLAIMER, COMPARISON_LAW } from "@/lib/legal-ads";
import { pageMeta } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const metadata = pageMeta({
  title: "Comparativas: unir PDF sin subirlo",
  description:
    "Luna Oficio no es iLovePDF, Smallpdf ni PDF24. Comparamos hechos: el archivo se queda en tu navegador. Marcas ajenas identificadas.",
  path: "/comparar",
  keywords: [
    "alternativa a ilovepdf",
    "unir pdf sin subir",
    "pdf en el navegador",
    "alternativa a smallpdf",
  ],
});

export default function CompararPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">Comparar</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Quien busca un conversor conocido llega aquí. Somos {SITE_NAME}.
      </h1>
      <p className="mt-4 text-muted-foreground">
        En España la publicidad comparativa es lícita si es objetiva, no
        confunde y no se aprovecha de la marca ajena como si fuéramos ellos.{" "}
        {COMPARISON_DISCLAIMER} {COMPARISON_LAW} El nombre de esta web es Luna
        Oficio. Las fichas identifican la marca de terceros y contrastan un
        hecho: ¿el archivo se sube o se queda en tu aparato?
      </p>
      <ul className="mt-10 grid gap-3">
        {competitors.map((item) => (
          <li key={item.slug}>
            <Link href={item.href} className="punch-card block p-5">
              <p className="font-heading text-2xl">Frente a {item.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.meta}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
