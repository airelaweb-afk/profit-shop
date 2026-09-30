"use client";

import { useSyncExternalStore } from "react";
import { getAdminVersion, subscribeAdmin } from "@/lib/admin";
import { getAuthVersion, subscribeAuth } from "@/lib/auth";

function subscribeAll(listener: () => void) {
  const a = subscribeAdmin(listener);
  const b = subscribeAuth(listener);
  return () => {
    a();
    b();
  };
}

function snapshot() {
  const admin = getAdminVersion();
  const auth = getAuthVersion();
  if (admin < 0 || auth < 0) return -1;
  return admin * 100_000 + auth;
}

/** -1 mientras hidrata; luego un contador que cambia con cada escritura. */
export function useAdminTick() {
  return useSyncExternalStore(subscribeAll, snapshot, () => -1);
}

export function formatDateEs(yyyymmdd: string) {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd;
  return `${yyyymmdd.slice(6, 8)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`;
}

export function formatIsoEs(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatEur(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);
}
