"use client";

export function Kpi({
  label,
  value,
  tone = "bone",
  hint,
}: {
  label: string;
  value: string | number;
  tone?: "bone" | "ink" | "signal" | "yellow";
  hint?: string;
}) {
  const classes = {
    bone: "bg-card text-foreground ring-1 ring-foreground/15",
    ink: "bg-foreground text-background",
    signal: "bg-primary text-primary-foreground",
    yellow: "bg-accent text-accent-foreground",
  }[tone];
  return (
    <div className={`rounded-[2px] p-4 ${classes}`}>
      <p className="font-mono text-[0.65rem] tracking-[0.18em] uppercase opacity-75">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs opacity-75">{hint}</p> : null}
    </div>
  );
}

export function Check({ ok, label, hint }: { ok: boolean; label: string; hint: string }) {
  return (
    <li className="flex items-start gap-3 border-b border-foreground/10 py-3 last:border-0">
      <span
        className={`mt-0.5 inline-block size-3 shrink-0 rounded-full ${ok ? "bg-primary" : "bg-foreground/25"}`}
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
    </li>
  );
}

export function StatusPill({ status }: { status: "activo" | "revocado" | "reembolsado" | "caducado" }) {
  const classes = {
    activo: "bg-foreground text-background",
    caducado: "bg-foreground/10 text-foreground",
    revocado: "bg-primary text-primary-foreground",
    reembolsado: "bg-accent text-accent-foreground",
  }[status];
  return (
    <span className={`rounded-[2px] px-1.5 py-0.5 font-mono text-[0.6rem] tracking-widest uppercase ${classes}`}>
      {status}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[2px] bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/15">
      {children}
    </p>
  );
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-[2px] bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>
  );
}
