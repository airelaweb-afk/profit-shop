import type { Metadata } from "next";
import { CartPage } from "@/components/cart-page";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CarritoRoute() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 font-heading text-4xl tracking-tight">Carrito</h1>
      <CartPage />
    </div>
  );
}
