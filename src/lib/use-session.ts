"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getSessionServerSnapshot,
  getSessionSnapshot,
  parseSession,
  subscribeAuth,
} from "@/lib/auth";

export function useSession() {
  const json = useSyncExternalStore(
    subscribeAuth,
    getSessionSnapshot,
    getSessionServerSnapshot,
  );
  return useMemo(() => parseSession(json), [json]);
}
