"use client";

import { useCallback, useEffect, useState } from "react";

type Result<T> = { key: string; data: T | null; error: string };

/** Carga datos de Supabase con estado de carga/error y recarga manual. */
export function useCloudQuery<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [tick, setTick] = useState(0);
  const key = `${tick}|${JSON.stringify(deps)}`;
  const [result, setResult] = useState<Result<T>>({ key: "", data: null, error: "" });

  useEffect(() => {
    let alive = true;
    loader()
      .then((value) => {
        if (alive) setResult({ key, data: value, error: "" });
      })
      .catch((caught: unknown) => {
        if (!alive) return;
        const message = caught instanceof Error ? caught.message : "No se pudo cargar.";
        setResult((prev) => ({ key, data: prev.data, error: message }));
      });
    return () => {
      alive = false;
    };
    // El loader cambia en cada render; la clave ya recoge las dependencias reales.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { data: result.data, error: result.error, loading: result.key !== key, reload };
}

export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
