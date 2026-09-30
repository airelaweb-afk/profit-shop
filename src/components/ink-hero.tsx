import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site-brand";

const ORBIT = [
  { label: "unir", top: "8%", left: "12%" },
  { label: "juntar", top: "18%", left: "78%" },
  { label: "comprimir", top: "72%", left: "8%" },
  { label: "heic", top: "80%", left: "70%" },
  { label: "firmar", top: "42%", left: "86%" },
  { label: "jpg↔pdf", top: "52%", left: "4%" },
  { label: "webp", top: "62%", left: "90%" },
];

const TOP_SEARCHES = [
  { href: "/unir-pdf", label: "Unir PDF" },
  { href: "/comprimir-pdf", label: "Comprimir PDF" },
  { href: "/comprimir-imagen", label: "Comprimir imagen" },
  { href: "/heic-a-jpg", label: "HEIC a JPG" },
  { href: "/jpg-a-pdf", label: "JPG a PDF" },
  { href: "/pdf", label: "Firmar PDF" },
  { href: "/jpg-a-webp", label: "JPG a WebP" },
  { href: "/dividir-pdf", label: "Dividir PDF" },
];

export function InkHero() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div
        className="hero-stripe pointer-events-none absolute -inset-x-1/4 -top-1/3 h-[140%] opacity-20 mix-blend-screen"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-16 top-10 size-64 opacity-30" aria-hidden="true">
        <LogoMark className="size-full" />
      </div>
      <div
        className="spark-float pointer-events-none absolute right-[12%] top-16 size-16 rounded-full bg-accent"
        aria-hidden="true"
      />
      <div className="hero-orbit pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        {ORBIT.map((item) => (
          <span
            key={item.label}
            className="absolute font-mono text-[0.65rem] tracking-[0.2em] text-accent uppercase"
            style={{ top: item.top, left: item.left }}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <p className="stamp-mark inline-block border-2 border-accent px-3 py-1 font-mono text-[0.68rem] font-medium tracking-[0.2em] text-accent uppercase">
          Gratis · En tu navegador · El archivo no se sube
        </p>
        <h1 className="mt-6 max-w-4xl font-heading text-4xl leading-[1.05] tracking-tight text-background sm:text-6xl lg:text-7xl">
          Unir PDF, comprimir imagen, HEIC a JPG.{" "}
          <span className="text-primary">Sin subir nada</span>{" "}
          <span className="text-accent">a ningún servidor.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-background/75">
          Las herramientas de archivo que más se buscan, resueltas en tu
          navegador: unes, comprimes, conviertes y firmas, y el PDF o la foto
          no salen de tu aparato. Además, documentos de trabajo listos en un
          minuto: presupuestos, partes de horas, relación de gastos y avisos
          de cobro en PDF.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-12 w-full px-6 sm:w-auto"
            render={<Link href="/unir-pdf" />}
            nativeButton={false}
          >
            Unir PDF
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            className="h-12 w-full border-2 border-accent bg-accent px-6 text-accent-foreground hover:bg-accent/90 sm:w-auto"
            render={<Link href="/comprimir-imagen" />}
            nativeButton={false}
          >
            Comprimir imagen
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full border-background/40 bg-transparent px-6 text-background hover:border-accent hover:bg-transparent hover:text-accent sm:w-auto"
            render={<Link href="/entrar/?tab=crear" />}
            nativeButton={false}
          >
            Crear cuenta gratis
          </Button>
        </div>
        <nav
          aria-label="Herramientas más buscadas"
          className="mt-12 max-w-3xl border-t border-background/20 pt-6"
        >
          <p className="font-mono text-[0.7rem] tracking-[0.18em] text-background/50 uppercase">
            Lo más buscado
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {TOP_SEARCHES.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-9 items-center rounded-[2px] border border-background/25 px-3 font-mono text-[0.7rem] tracking-[0.14em] text-background/85 uppercase transition hover:border-accent hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="signal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
