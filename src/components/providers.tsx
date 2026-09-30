"use client";

import { CartProvider } from "@/lib/cart";
import { CookieBanner } from "@/components/cookie-banner";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CookieBanner />
    </CartProvider>
  );
}
