"use client";

import { useSyncExternalStore } from "react";
import {
  getConsentSnapshot,
  parseConsent,
  subscribeConsent,
} from "@/lib/consent";
import {
  getProSnapshot,
  isProFromSnapshot,
  parsePro,
  subscribePro,
} from "@/lib/pro";

export function useConsent() {
  const json = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    () => "",
  );
  return parseConsent(json);
}

export function usePro() {
  const json = useSyncExternalStore(subscribePro, getProSnapshot, () => "");
  return isProFromSnapshot(json);
}

export function useProState() {
  const json = useSyncExternalStore(subscribePro, getProSnapshot, () => "");
  return parsePro(json);
}
