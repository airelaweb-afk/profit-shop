import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description:
    "Herramientas admin puntuales, sin CRM, pensadas para que la gente las encuentre sola en internet.",
};

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">El enfoque</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Cosas que no existen como producto (aunque el problema sí)
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Un CRM te pide agenda, clientes, facturas y hábitos nuevos. Un autónomo
        lo que quiere el martes es: “tengo que mandar diez presupuestos iguales
        a diez sitios”. Eso no es un CRM. Es una herramienta de un solo
        propósito.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="font-heading text-2xl">Qué es “no existir”</h2>
          <p className="mt-2 text-muted-foreground">
            Facturar existe. Excel existe. Lo que no existe es el botón del
            medio: pegar una lista y salir con papeles presentables, sin dar de
            alta la empresa. Ahí se posiciona: búsquedas del tipo “hacer varios
            presupuestos a la vez”, no “mejor software de gestión”.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl">IA sí, producto genérico no</h2>
          <p className="mt-2 text-muted-foreground">
            La IA sirve para escribir textos, variar ejemplos y acelerar. La
            herramienta tiene que hacer un cálculo o un lote que un chat no hace
            bien: diez PDFs, diez importes con IVA, diez cabeceras distintas.
            Si ChatGPT ya lo resuelve en un mensaje, no es un producto.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl">Cómo se encuentra sola</h2>
          <p className="mt-2 text-muted-foreground">
            Cada herramienta es una página con un título claro. Quien busca el
            problema llega, la usa gratis, y si más adelante hay un pack de
            pago o un extra, ya conoció el valor. No hace falta estar vendiéndola
            en un chat.
          </p>
        </section>
      </div>

      <Button
        className="mt-10 h-11 px-5"
        render={<Link href="/presupuestos" />}
        nativeButton={false}
      >
        Abrir la tanda de presupuestos
      </Button>
    </div>
  );
}
