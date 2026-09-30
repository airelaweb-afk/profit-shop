import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Cómo funciona",
  description:
    "Herramientas admin puntuales, sin CRM: unir PDF y presupuestos en el navegador. Los archivos no se suben. Se encuentran solas en Google.",
  path: "/como-funciona",
});

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
          <h2 className="font-heading text-2xl">Sin cuenta para usarlas</h2>
          <p className="mt-2 text-muted-foreground">
            Unir, comprimir, firmar y el resto se usan al entrar, sin registro.
            Gratis tiene un tope (archivos, peso, 10 tareas al día). La cuenta
            solo hace falta si pagas Pro y quieres llevarlo a otro aparato.
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
        <section>
          <h2 className="font-heading text-2xl">Si buscan el nombre de otro</h2>
          <p className="mt-2 text-muted-foreground">
            Quien escribe el nombre de un conversor famoso suele querer unir o
            comprimir un PDF. En España se puede aterrizar esa búsqueda con
            publicidad comparativa objetiva (Ley 3/1991 art. 10, Ley 17/2001):
            el producto se llama Luna Oficio, no usamos su logo y contrastamos
            un hecho (el archivo se queda en el navegador). Las fichas están en
            Comparar.
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
          render={<Link href="/blog" />}
          nativeButton={false}
        >
          Leer el blog
        </Button>
      </div>
    </div>
  );
}
