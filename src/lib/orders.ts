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

const KEY = "luna-atelier-orders";

function readAll(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(orders: Order[]) {
  window.localStorage.setItem(KEY, JSON.stringify(orders));
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
