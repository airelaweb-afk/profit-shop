"use client";

import { verifyProKey, type ProKeyInfo } from "@/lib/pro-keys";

const KEY = "luna-oficio-pro";

export type ProState = {
  serial: string;
  expires: string;
  activatedAt: string;
  legacy?: boolean;
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function getProSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}

export function subscribePro(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function parsePro(json: string): ProState | null {
  if (!json) return null;
  if (json === "1") {
    return { serial: "MASTER", expires: "20991231", activatedAt: "", legacy: true };
  }
  try {
    const parsed = JSON.parse(json) as ProState;
    if (!parsed?.serial || !parsed.expires) return null;
    return parsed;
  } catch {
    return null;
  }
}

function expiryDate(expires: string) {
  const y = Number(expires.slice(0, 4));
  const m = Number(expires.slice(4, 6));
  const d = Number(expires.slice(6, 8));
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
}

export function isProFromSnapshot(json: string) {
  const state = parsePro(json);
  if (!state) return false;
  return expiryDate(state.expires).getTime() > Date.now();
}

export async function activatePro(code: string): Promise<ProKeyInfo> {
  const info = await verifyProKey(code);
  if (!info) {
    throw new Error("Esa clave no vale. Si has pagado, escríbenos.");
  }
  if (info.revoked) {
    throw new Error("Esa clave ha sido anulada. Escríbenos si crees que es un error.");
  }
  if (info.expiresAt.getTime() < Date.now()) {
    throw new Error("Esa clave ha caducado. Renueva Pro para seguir sin anuncios.");
  }
  const state: ProState = {
    serial: info.serial,
    expires: info.expires,
    activatedAt: new Date().toISOString(),
    legacy: info.legacy || undefined,
  };
  window.localStorage.setItem(KEY, JSON.stringify(state));
  emit();
  return info;
}

export function deactivatePro() {
  window.localStorage.removeItem(KEY);
  emit();
}
