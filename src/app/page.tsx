import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    href: "/presupuestos",
    name: "Presupuestos",
    problem: "Tengo que mandar el mismo trabajo a diez clientes.",
    does: "Pegar la lista. Un PDF por cliente, con tu logo.",
  },
  {
    href: "/versiones",
    name: "Versiones",
    problem: "El cliente quiere ver básico, recomendado y urgente.",
    does: "Un encargo, varias ofertas. Elige en el papel.",
  },
  {
    href: "/cobros",
    name: "Cobros",
    problem: "Me deben y no quiero pelearme por WhatsApp.",
    does: "Lista de impagos → mensaje listo, amable o último aviso.",
  },
  {
    href: "/horas",
    name: "Horas",
    problem: "La semana se me ha ido en notas sueltas.",
    does: "Un parte de horas para el cliente o el jefe.",
  },
  {
    href: "/gastos",
    name: "Gastos",
    problem: "El gestor me pide los tickets y los tengo en el cajón.",
    does: "Pegas fecha, tienda e importe. Sale base e IVA.",
  },
  {
    href: "/pdf",
    name: "Firmar PDF",
    problem: "Me mandan un PDF y no tengo Adobe para rellenarlo.",
    does: "Subes el que te han mandado. Escribes donde haga falta, firmas y te lo descargas.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-sm tracking-wide text-primary uppercase">
          Herramientas admin · autónomos y secretaría
        </p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          El trabajo feo de la oficina, resuelto en una página.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          No es un CRM. No pide cuenta. Pegas lo que tienes, sales con un PDF o
          un WhatsApp. Los datos se quedan en tu navegador.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-11 px-5"
            render={<Link href="/presupuestos" />}
            nativeButton={false}
          >
            Empezar por presupuestos
            <ArrowRight />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-5"
            render={<Link href="/gastos" />}
            nativeButton={false}
          >
            Relación de gastos
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-11 px-5"
            render={<Link href="/pdf" />}
            nativeButton={false}
          >
            Firmar un PDF
          </Button>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="font-heading text-2xl sm:text-3xl">Las que hay ahora</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Entras en la del atasco de hoy. Si no sirve, se corrige. Si sirve, se
          queda gratis.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="flex h-full flex-col rounded-2xl bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:bg-muted/40"
              >
                <p className="font-heading text-xl">{tool.name}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  {tool.problem}
                </p>
                <p className="mt-2 text-sm">{tool.does}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
                  Abrir
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
