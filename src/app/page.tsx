import Link from "next/link";
import { ArrowRight, FileStack, Printer, ShieldOff } from "lucide-react";
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
            Holded, Notion y Excel ya existen. Lo que casi no existe es una
            herramienta que haga <em>una sola cosa pesada</em> —diez
            presupuestos, diez recordatorios— sin pedirte que metas la empresa
            entera en un sistema. Entras, pegas una lista, te llevas los
            papeles. Google puede encontrar esto. Tú no tienes que venderlo en
            un chat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-11 px-5"
              render={<Link href="/presupuestos" />}
              nativeButton={false}
            >
              Probar la tanda de presupuestos
              <ArrowRight />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-5"
              render={<Link href="/como-funciona" />}
              nativeButton={false}
            >
              Cómo se posiciona esto
            </Button>
          </div>
        </div>
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
          <p className="font-heading text-2xl">La primera herramienta</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tanda de presupuestos: los mismos servicios, muchos destinatarios.
            Imprime o guarda PDF. Los datos se quedan en tu navegador.
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex gap-3">
              <FileStack className="mt-0.5 size-4 shrink-0 text-primary" />
              Hasta 30 documentos de una lista pegada.
            </li>
            <li className="flex gap-3">
              <Printer className="mt-0.5 size-4 shrink-0 text-primary" />
              Un clic para imprimir o “Guardar como PDF”.
            </li>
            <li className="flex gap-3">
              <ShieldOff className="mt-0.5 size-4 shrink-0 text-primary" />
              Cero cuenta, cero pipeline, cero base de datos nuestra.
            </li>
          </ul>
        </div>
      </section>

      <section className="border-y border-border/80 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-heading text-3xl">Las siguientes (cuando esta se use)</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            No son un CRM a trozos. Cada una ataca un atasco que hoy se hace a
            mano, copiando un Word diez veces.
          </p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "02",
                title: "Diez versiones de un mismo trabajo",
                text: "Bueno / mejor / completo, con y sin urgencia, para un solo cliente. Hoy eso son 6 Word.",
              },
              {
                n: "03",
                title: "Tanda de recordatorios de cobro",
                text: "Pegas quién te debe y desde cuándo. Sales con 10 textos de WhatsApp o correo, serios, no agresivos.",
              },
              {
                n: "04",
                title: "De horas a presupuesto",
                text: "Pegar un registro semanal y salir con conceptos e importes, no con una hoja ilegible.",
              },
            ].map((item) => (
              <li key={item.n} className="rounded-2xl bg-background p-5 ring-1 ring-foreground/10">
                <p className="font-heading text-xl text-primary">{item.n}</p>
                <p className="mt-2 font-medium">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
