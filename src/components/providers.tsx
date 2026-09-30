"use client";

import { useEffect, type ReactNode } from "react";
import { CookieBanner } from "@/components/cookie-banner";
import { initCloudAuth } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    initCloudAuth();
  }, []);

  return (
    <CartProvider>
      {children}
      <CookieBanner />
    </CartProvider>
  );
}
