"use client";

import Link from "next/link";
import { DownloadButton } from "@/components/download-button";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/money";
import { useOrder } from "@/lib/use-order";

export function OrderReceipt({ id }: { id: string }) {
  const order = useOrder(id);

  if (order === undefined) {
    return <p className="text-sm text-muted-foreground">Buscando el pedido…</p>;
  }

  if (!order) {
    return (
      <div className="rounded-2xl bg-card p-8 ring-1 ring-foreground/10">
        <h1 className="font-heading text-3xl">No encontramos ese pedido</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Los pedidos de esta demo se guardan en este navegador. Si abriste el
          enlace en otro dispositivo, no va a aparecer.
        </p>
        <Button
          className="mt-5 h-11 px-5"
          render={<Link href="/tienda" />}
          nativeButton={false}
        >
          Volver a la tienda
        </Button>
      </div>
    );
  }

  const when = new Date(order.createdAt).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
      <p className="text-sm text-muted-foreground">Pedido {order.id}</p>
      <h1 className="mt-1 font-heading text-3xl sm:text-4xl">
        Listo. Tus archivos están aquí.
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Hola {order.name}. En una tienda real este correo ({order.email})
        recibiría el enlace. Aquí la descarga es inmediata.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{when}</p>

      <ul className="mt-8 divide-y divide-border">
        {order.items.map((item) => (
          <li
            key={item.slug}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <DownloadButton slug={item.slug} label={`Descargar ${item.name}`} />
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between font-medium">
        <span>Total</span>
        <span>{formatPrice(order.total)}</span>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          className="h-11 px-5"
          render={<Link href="/tienda" />}
          nativeButton={false}
        >
          Seguir comprando
        </Button>
        <Button
          variant="outline"
          className="h-11 px-5"
          render={<Link href="/como-vender" />}
          nativeButton={false}
        >
          Cómo vender esto de verdad
        </Button>
      </div>
    </div>
  );
}
