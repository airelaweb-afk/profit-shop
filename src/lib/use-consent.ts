"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getProfileSnapshot,
  parseProfile,
  profileIsPro,
  subscribeProfile,
} from "@/lib/cloud";
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

/** Perfil de la cuenta en la nube (null sin Supabase o sin sesión). */
export function useProfile() {
  const json = useSyncExternalStore(subscribeProfile, getProfileSnapshot, () => "");
  return useMemo(() => parseProfile(json), [json]);
}

/** Pro = clave firmada activada en este navegador o Pro vigente en la cuenta. */
export function usePro() {
  const json = useSyncExternalStore(subscribePro, getProSnapshot, () => "");
  const profile = useProfile();
  return isProFromSnapshot(json) || profileIsPro(profile);
}

export function useProState() {
  const json = useSyncExternalStore(subscribePro, getProSnapshot, () => "");
  return parsePro(json);
}
