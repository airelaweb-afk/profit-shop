"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(pointer: coarse)");
  if (typeof media.addEventListener === "function") {
    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
  }
  media.addListener(onStoreChange);
  return () => media.removeListener(onStoreChange);
}

function getSnapshot() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
