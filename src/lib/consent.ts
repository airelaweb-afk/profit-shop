"use client";

const KEY = "luna-oficio-consent";

export type Consent = {
  necessary: true;
  ads: boolean;
  decidedAt: string | null;
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function empty(): Consent {
  return { necessary: true, ads: false, decidedAt: null };
}

function read(): Consent {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Consent;
    if (parsed?.necessary !== true) return empty();
    return {
      necessary: true,
      ads: Boolean(parsed.ads),
      decidedAt: parsed.decidedAt ?? null,
    };
  } catch {
    return empty();
  }
}

export function getConsentSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY) ?? "";
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function parseConsent(json: string): Consent {
  if (!json) return empty();
  try {
    const parsed = JSON.parse(json) as Consent;
    return {
      necessary: true,
      ads: Boolean(parsed.ads),
      decidedAt: parsed.decidedAt ?? null,
    };
  } catch {
    return empty();
  }
}

export function saveConsent(ads: boolean) {
  const next: Consent = {
    necessary: true,
    ads,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}
