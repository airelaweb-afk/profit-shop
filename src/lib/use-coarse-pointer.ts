"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(pointer: coarse)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
