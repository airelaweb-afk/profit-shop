"use client";

const KEY = "luna-oficio-pro";
const VALID = new Set(["LUNA-OFICIO-PRO"]);

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

export function isProFromSnapshot(json: string) {
  return json === "1";
}

export function activatePro(code: string) {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!VALID.has(normalized)) {
    throw new Error("Esa clave no vale. Si has pagado, escríbenos.");
  }
  window.localStorage.setItem(KEY, "1");
  emit();
}

export function deactivatePro() {
  window.localStorage.removeItem(KEY);
  emit();
}
