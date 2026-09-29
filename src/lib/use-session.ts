"use client";

import { useSyncExternalStore } from "react";
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
  return parseSession(json);
}
