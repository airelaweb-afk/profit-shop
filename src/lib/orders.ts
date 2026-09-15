export type OrderItem = {
  slug: string;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  name: string;
  email: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

export const ORDERS_KEY = "luna-atelier-orders";
export const ORDERS_SERVER_SNAPSHOT = "";
export const ORDERS_EMPTY_JSON = "[]";

const listeners = new Set<() => void>();

export function subscribeOrders(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function emit() {
  for (const listener of listeners) listener();
}

function readAll(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders: Order[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  emit();
}

export function getOrdersJson() {
  return window.localStorage.getItem(ORDERS_KEY) ?? ORDERS_EMPTY_JSON;
}

export function getOrdersServerSnapshot() {
  return ORDERS_SERVER_SNAPSHOT;
}

export function createOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LA-${stamp}-${rand}`;
}

export function saveOrder(order: Order) {
  const orders = readAll().filter((item) => item.id !== order.id);
  orders.unshift(order);
  writeAll(orders.slice(0, 30));
}

export function getOrder(id: string) {
  return readAll().find((order) => order.id === id) ?? null;
}
