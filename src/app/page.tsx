import Link from "next/link";
import { ArrowRight, Copy, FileStack, Printer, ShieldOff } from "lucide-react";
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
            Presupuestos en lote y recordatorios de cobro: pegas una lista, te
            llevas papeles o textos. Sin meter la empresa en un sistema. Sin
            perseguir a nadie por chat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-11 px-5"
              render={<Link href="/cobros" />}
              nativeButton={false}
            >
              Recordatorios de cobro
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-5"
              render={<Link href="/presupuestos" />}
              nativeButton={false}
            >
              Tanda de presupuestos
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
          <p className="font-heading text-2xl">Ahora mismo</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3">
              <Copy className="mt-0.5 size-4 shrink-0 text-primary" />
              Recordatorios: 10 textos de cobro, serios, listos para pegar.
            </li>
            <li className="flex gap-3">
              <FileStack className="mt-0.5 size-4 shrink-0 text-primary" />
              Presupuestos: los mismos servicios, muchos destinatarios.
            </li>
            <li className="flex gap-3">
              <Printer className="mt-0.5 size-4 shrink-0 text-primary" />
              Imprimir PDF o copiar. Los datos se quedan en tu navegador.
            </li>
            <li className="flex gap-3">
              <ShieldOff className="mt-0.5 size-4 shrink-0 text-primary" />
              Cero cuenta, cero pipeline.
            </li>
          </ul>
        </div>
      </section>

      <section className="border-y border-border/80 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-3xl">La que aún no está</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            <strong>Versiones de un mismo trabajo</strong> no es diez clientes.
            Es un solo cliente y un solo encargo, con varias ofertas: básico /
            completo, con o sin urgencia. Hoy eso son seis Word. Cuando la
            montemos, saldrá en esta misma web.
          </p>
        </div>
      </section>
    </div>
  );
}
