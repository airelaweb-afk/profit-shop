const KEY = "luna-oficio-quota";

type Quota = { day: string; n: number };

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function read(): Quota {
  if (typeof window === "undefined") return { day: today(), n: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Quota | null;
    if (!parsed?.day || parsed.day !== today()) return { day: today(), n: 0 };
    return { day: parsed.day, n: Number(parsed.n) || 0 };
  } catch {
    return { day: today(), n: 0 };
  }
}

export function jobsUsedToday() {
  return read().n;
}

/** Returns an error message if the free daily cap is hit. Does not increment. */
export function quotaBlock(pro: boolean, jobsPerDay: number) {
  if (pro || !Number.isFinite(jobsPerDay)) return null;
  const used = read().n;
  if (used >= jobsPerDay) {
    return `Hoy ya has usado las ${jobsPerDay} tareas gratis. Pro es ilimitado.`;
  }
  return null;
}

export function markJobDone(pro: boolean) {
  if (pro || typeof window === "undefined") return;
  const current = read();
  window.localStorage.setItem(KEY, JSON.stringify({ day: current.day, n: current.n + 1 }));
}
