import Link from "next/link";
import { ArrowRight, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturedRemoveBg() {
  return (
    <section className="bg-[#f7f4ee] pt-10 sm:pt-14">
      <div className="luna-wrap">
        <div className="relative overflow-hidden rounded-2xl border-2 border-foreground bg-primary text-primary-foreground shadow-[8px_8px_0_0_#12110f]">
          <div
            className="hero-stripe pointer-events-none absolute -inset-x-1/4 -top-1/2 h-[200%] opacity-15 mix-blend-multiply"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <span className="spark-float flex size-16 shrink-0 items-center justify-center rounded-2xl bg-foreground text-accent">
                <Eraser className="size-8" strokeWidth={2} />
              </span>
              <div>
                <span className="new-glow inline-block rounded-full bg-accent px-3 py-1 font-mono text-[0.68rem] font-semibold tracking-[0.2em] text-accent-foreground uppercase">
                  Nuevo
                </span>
                <h2 className="mt-3 font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
                  Quitar fondo de una imagen
                </h2>
                <p className="mt-2 max-w-xl text-primary-foreground/85">
                  Sube la foto y sales con un PNG transparente en segundos. Se
                  hace en tu navegador: la imagen no sale de tu aparato.
                </p>
              </div>
            </div>
            <Button
              size="lg"
              className="h-12 w-full shrink-0 border-2 border-foreground bg-foreground px-6 text-background hover:bg-foreground/90 md:w-auto"
              render={<Link href="/quitar-fondo/" prefetch={false} />}
              nativeButton={false}
            >
              Quitar fondo gratis
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
