const EVENT = "luna-file-saved";

/** A file was saved or a document was printed. The bookmark prompt listens. */
export function offerBookmark() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function onFileSaved(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
