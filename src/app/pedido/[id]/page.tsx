import type { Metadata } from "next";
import { OrderReceipt } from "@/components/order-receipt";

export const metadata: Metadata = {
  title: "Pedido",
};

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <OrderReceipt id={id} />
    </div>
  );
}
