import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/site-brand";
import { PRO_MONTHLY, PRO_YEARLY } from "@/lib/payments";

export function InkHero() {
  return (
    <section className="relative overflow-hidden bg-foreground text-background">
      <div
        className="hero-stripe pointer-events-none absolute -inset-x-1/4 -top-1/3 h-[140%] opacity-20 mix-blend-screen"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-16 top-6 size-48 opacity-25" aria-hidden="true">
        <LogoMark className="size-full" />
      </div>
      <div
        className="spark-float pointer-events-none absolute right-[10%] top-10 size-12 rounded-full bg-accent"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <p className="stamp-mark inline-block border-2 border-accent px-3 py-1 font-mono text-[0.68rem] font-medium tracking-[0.2em] text-accent uppercase">
          Gratis · Sin cuenta · Sin subir archivos
        </p>
        <h1 className="mt-5 max-w-4xl font-heading text-4xl leading-[1.05] tracking-tight text-background sm:text-6xl">
          Todas las herramientas PDF e imagen.{" "}
          <span className="text-primary">En tu navegador.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-background/75">
          Unir, comprimir, convertir, firmar. El archivo no se sube. Gratis
          con un tope; Pro ilimitado por {PRO_MONTHLY}/mes o {PRO_YEARLY}/año.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-12 w-full px-6 sm:w-auto"
            render={<Link href="#herramientas" />}
            nativeButton={false}
          >
            Ver herramientas
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            className="h-12 w-full border-2 border-accent bg-accent px-6 text-accent-foreground hover:bg-accent/90 sm:w-auto"
            render={<Link href="/unir-pdf" />}
            nativeButton={false}
          >
            Unir PDF
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full border-background/40 bg-transparent px-6 text-background hover:border-accent hover:bg-transparent hover:text-accent sm:w-auto"
            render={<Link href="/precios" />}
            nativeButton={false}
          >
            Pro, sin límite
          </Button>
        </div>
      </div>
      <div className="signal-bar" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
