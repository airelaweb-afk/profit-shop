import Link from "next/link";
import { ArrowRight, Copy, FileStack, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
        <div>
          <p className="text-sm tracking-wide text-primary uppercase">
            Herramientas admin · autónomos y empresas pequeñas
          </p>
          <h1 className="mt-3 font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            No otro CRM. Un trabajo feo, resuelto de un tirón.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Tres atascos de copiar Word: muchos clientes, muchos cobros, o un
            solo trabajo con varios precios. Entras, pegas, imprimes o copias.
            Nadie te pide dar de alta la empresa.
          </p>
          <ol className="mt-6 max-w-xl list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Abre Presupuestos. Sube el logo o pulsa “Cargar ejemplo”.</li>
            <li>Revisa NIF, IVA y servicios. Pega a quién se lo mandas.</li>
            <li>Mira la vista previa. Imprime o “guardar como PDF”.</li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-11 px-5"
              render={<Link href="/presupuestos" />}
              nativeButton={false}
            >
              Tanda de presupuestos
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-5"
              render={<Link href="/versiones" />}
              nativeButton={false}
            >
              Un cliente, varias ofertas
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
          <p className="font-heading text-2xl">Las tres</p>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <FileStack className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <Link href="/presupuestos" className="font-medium hover:underline">
                  Presupuestos
                </Link>
                : los mismos servicios, muchos clientes. Con logo.
              </span>
            </li>
            <li className="flex gap-3">
              <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <Link href="/versiones" className="font-medium hover:underline">
                  Versiones
                </Link>
                : un solo cliente, varias ofertas (básico / completo).
              </span>
            </li>
            <li className="flex gap-3">
              <Copy className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <Link href="/cobros" className="font-medium hover:underline">
                  Cobros
                </Link>
                : quién te debe → textos de WhatsApp o correo.
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
