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
        Un CRM te pide agenda, clientes, facturas y hábitos nuevos. Quien lleva
        la administración quiere el martes: “diez presupuestos”, “estos cobros”
        o “estos tickets para el gestor”. Eso no es un CRM. Es una página.
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
        <section>
          <h2 className="font-heading text-2xl">Hace falta una cuenta</h2>
          <p className="mt-2 text-muted-foreground">
            Las herramientas (presupuestos, cobros, horas, gastos y firmar PDF)
            solo se usan si has iniciado sesión. La cuenta se crea en el sitio y
            vive en este navegador: no hay Cl@ve, ni servidor de usuarios, ni
            recuperación en otro ordenador. Si cambias de aparato, la creas otra
            vez.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl">Unir y comprimir PDF</h2>
          <p className="mt-2 text-muted-foreground">
            Lo que más se busca: juntar varios PDF, partir páginas, bajar el
            peso, pasar fotos a PDF o al revés. Se hace en este navegador. No
            convertimos a Word: sin servidor el resultado sería un documento
            feo, y no vale la pena. Queda aparcado.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl">Comprimir y convertir fotos</h2>
          <p className="mt-2 text-muted-foreground">
            Comprimir, PNG a JPG, HEIC del iPhone, recortar y girar. También
            audio a WAV. Quitar el fondo, ampliar con IA, vídeo y PDF a Word
            no: piden servidor o un motor que aquí no hay.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl">Rellenar y firmar un PDF</h2>
          <p className="mt-2 text-muted-foreground">
            Adobe cobra. Los “firma gratis” de internet se quedan el archivo.
            Aquí, con la sesión iniciada, subes el PDF que te han mandado,
            amplías la hoja, marcas casillas, escribes y firmas. Te lo llevas.
            No sale del navegador. No sustituye a Cl@ve ni a un certificado
            digital.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button
          className="h-11 px-5"
          render={<Link href="/unir-pdf" />}
          nativeButton={false}
        >
          Unir PDF
        </Button>
        <Button
          variant="outline"
          className="h-11 px-5"
          render={<Link href="/presupuestos" />}
          nativeButton={false}
        >
          Tanda de presupuestos
        </Button>
      </div>
    </div>
  );
}
