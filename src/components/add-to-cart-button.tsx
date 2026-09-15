"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  slug,
  className,
  size = "lg",
  label = "Añadir al carrito",
}: {
  slug: string;
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      size={size}
      className={cn("h-11 px-5", className)}
      onClick={() => {
        setAdded(true);
        add(slug);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? <Check /> : <ShoppingBag />}
      {added ? "Añadido" : label}
    </Button>
  );
}

export function BuyNowButton({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const router = useRouter();
  const { add, items } = useCart();

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className={cn("h-11 px-5", className)}
      onClick={() => {
        if (!items.some((item) => item.slug === slug)) add(slug);
        router.push("/checkout");
      }}
    >
      Comprar ahora
    </Button>
  );
}
