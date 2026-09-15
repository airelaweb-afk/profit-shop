import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cómo vender",
  description:
    "Por qué una tienda de descargas digitales es un camino realista para ganar dinero en internet.",
};

const steps = [
  {
    n: "01",
    title: "Elige un oficio que ya conoces",
    text: "No inventes un nicho de moda. Si diseñas, das clases, haces fotos o llevas redes, vende la herramienta que tú mismo usarías: un planner, una factura, un pack de posts, una lista de precios.",
  },
  {
    n: "02",
    title: "Haz el archivo una vez",
    text: "Un PDF o un Canva bien hecho se vende 200 veces sin reimprimir. El trabajo pesado es el primero. Después, cada pedido es un enlace.",
  },
  {
    n: "03",
    title: "Pon la tienda en tu dominio",
    text: "Esta web ya tiene catálogo, carrito y descarga. Publícala, cambia los productos por los tuyos y conecta Stripe, Lemon Squeezy o Mercado Pago cuando quieras cobrar de verdad.",
  },
  {
    n: "04",
    title: "Habla donde ya te leen",
    text: "Un post a la semana con una oferta clara vende más que un feed bonito. El Pack Instagram de esta tienda está pensado exactamente para eso.",
  },
];

export default function ComoVenderPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sm tracking-wide text-primary uppercase">El modelo</p>
      <h1 className="mt-2 font-heading text-4xl tracking-tight sm:text-5xl">
        Cómo se gana dinero con una tienda así
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Dropshipping de ropa y “cursos milagro” suelen comerse el margen o la
        reputación. Los productos digitales no: no hay almacén, no hay aduanas
        y el cliente recibe el archivo en el acto.
      </p>

      <div className="mt-10 space-y-8">
        {steps.map((step) => (
          <section key={step.n} className="grid gap-2 sm:grid-cols-[4rem_1fr]">
            <p className="font-heading text-2xl text-primary">{step.n}</p>
            <div>
              <h2 className="font-heading text-2xl">{step.title}</h2>
              <p className="mt-2 text-muted-foreground">{step.text}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
        <h2 className="font-heading text-2xl">Números honestos</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>
            Un planner a 12 USD: si vendes 40 al mes, son 480 USD. El archivo
            ya está hecho.
          </li>
          <li>
            Un bundle a 39 USD: diez ventas cubren un mes de herramientas y
            dominio.
          </li>
          <li>
            La demo de esta tienda no cobra tarjeta. El flujo (carrito → pago →
            descarga) es el mismo que usarás con un procesador real.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          size="lg"
          className="h-11 px-5"
          render={<Link href="/tienda" />}
          nativeButton={false}
        >
          Probar la tienda
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-11 px-5"
          render={<Link href="/producto/bundle-emprendedor" />}
          nativeButton={false}
        >
          Ver el producto ancla
        </Button>
      </div>
    </div>
  );
}
