"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "./products";

export type CartItem = {
  slug: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  lines: { product: Product; quantity: number }[];
};

const KEY = "luna-atelier-cart";
const CartContext = createContext<CartContextValue | null>(null);

function normalize(items: CartItem[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!getProduct(item.slug) || item.quantity < 1) continue;
    map.set(item.slug, (map.get(item.slug) ?? 0) + item.quantity);
  }
  return [...map.entries()].map(([slug, quantity]) => ({ slug, quantity }));
}

let memory: CartItem[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return normalize(JSON.parse(raw) as CartItem[]);
  } catch {
    return [];
  }
}

function getSnapshot() {
  if (memory === null) memory = readStorage();
  return memory;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function write(items: CartItem[]) {
  memory = items;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

function subscribeMounted() {
  return () => {};
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );

  const add = useCallback((slug: string, quantity = 1) => {
    write(normalize([...getSnapshot(), { slug, quantity }]));
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    write(
      normalize(
        getSnapshot().map((item) =>
          item.slug === slug ? { ...item, quantity } : item,
        ),
      ),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    write(getSnapshot().filter((item) => item.slug !== slug));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo(() => {
    const lines = items
      .map((item) => {
        const product = getProduct(item.slug);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter((line): line is { product: Product; quantity: number } =>
        Boolean(line),
      );
    return {
      items,
      ready,
      add,
      setQuantity,
      remove,
      clear,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce(
        (sum, line) => sum + line.product.price * line.quantity,
        0,
      ),
      lines,
    };
  }, [add, clear, items, ready, remove, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
