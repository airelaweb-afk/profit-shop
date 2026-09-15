"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getOrder,
  getOrdersJson,
  getOrdersServerSnapshot,
  subscribeOrders,
  type Order,
} from "./orders";

export function useOrder(id: string): Order | null | undefined {
  const json = useSyncExternalStore(
    subscribeOrders,
    getOrdersJson,
    getOrdersServerSnapshot,
  );
  return useMemo(() => {
    if (json === "") return undefined;
    return getOrder(id);
  }, [id, json]);
}
