"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrderReceipt } from "@/components/order-receipt";

function Receipt() {
  const id = useSearchParams().get("id") ?? "";
  return <OrderReceipt id={id} />;
}

export default function PedidoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Buscando el pedido…</p>
        }
      >
        <Receipt />
      </Suspense>
    </div>
  );
}
