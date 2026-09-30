"use client";

import { useState } from "react";
import { Empty, ErrorNote } from "@/components/admin/admin-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminListUsers, adminSetAdmin } from "@/lib/cloud";
import type { AdminUserRow } from "@/lib/supabase";
import { formatIsoEs } from "@/lib/use-admin";
import { useCloudQuery, useDebounced } from "@/lib/use-cloud";
import { useSession } from "@/lib/use-session";

const PAGE = 50;

function isPro(user: AdminUserRow) {
  return !!user.pro_until && new Date(user.pro_until).getTime() > Date.now();
}

function UserRow({
  user,
  me,
  onGrant,
  onChange,
}: {
  user: AdminUserRow;
  me: boolean;
  onGrant: (user: AdminUserRow) => void;
  onChange: () => void;
}) {
  const [error, setError] = useState("");
  const pro = isPro(user);
  return (
    <li className="rounded-[2px] bg-card p-4 ring-1 ring-foreground/15">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-heading text-lg">
            {user.name || user.email.split("@")[0]}
            {user.is_admin ? (
              <span className="ml-2 font-mono text-[0.65rem] tracking-widest text-primary uppercase">admin</span>
            ) : null}
            {me ? (
              <span className="ml-2 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">tú</span>
            ) : null}
          </p>
          <p className="text-sm text-muted-foreground">
            {user.email} · alta {formatIsoEs(user.created_at)}
            {user.last_sign_in_at ? ` · último acceso ${formatIsoEs(user.last_sign_in_at)}` : " · nunca ha entrado"}
            {!user.email_confirmed_at ? " · correo sin confirmar" : ""}
          </p>
          <p className="mt-1 text-sm">
            {pro ? (
              <span className="rounded-[2px] bg-foreground px-1.5 py-0.5 font-mono text-[0.6rem] tracking-widest text-background uppercase">
                Pro hasta {formatIsoEs(user.pro_until!)}
              </span>
            ) : (
              <span className="rounded-[2px] bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.6rem] tracking-widest uppercase">
                Gratis
              </span>
            )}
            {user.memberships_count > 0 ? (
              <span className="ml-2 text-xs text-muted-foreground">
                {user.memberships_count} {user.memberships_count === 1 ? "cobro" : "cobros"}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button variant="outline" className="h-9" onClick={() => onGrant(user)}>
            {pro ? "Ampliar Pro" : "Dar Pro"}
          </Button>
          {!me ? (
            <Button
              variant="ghost"
              className="h-9"
              onClick={() => {
                const next = !user.is_admin;
                if (!confirm(next ? `¿Hacer administrador a ${user.email}? Verá todo el panel.` : `¿Quitar administración a ${user.email}?`)) return;
                setError("");
                adminSetAdmin(user.id, next)
                  .then(onChange)
                  .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Error."));
              }}
            >
              {user.is_admin ? "Quitar admin" : "Hacer admin"}
            </Button>
          ) : null}
        </div>
      </div>
      <ErrorNote message={error} />
    </li>
  );
}

export function CloudAccounts({ onGrant }: { onGrant: (user: AdminUserRow) => void }) {
  const session = useSession();
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const debounced = useDebounced(search);
  const list = useCloudQuery(() => adminListUsers(debounced, limit, 0), [debounced, limit]);
  const rows = list.data ?? [];
  const proCount = rows.filter(isPro).length;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-2xl">Cuentas registradas</h2>
          <p className="text-sm text-muted-foreground">
            Todas las cuentas de la web, de cualquier aparato.
            {list.data ? ` Mostrando ${rows.length}, ${proCount} con Pro.` : ""}
          </p>
        </div>
        <Button variant="outline" className="h-10" onClick={list.reload}>
          Actualizar
        </Button>
      </div>
      <Input
        className="h-11"
        placeholder="Buscar por correo o nombre"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setLimit(PAGE);
        }}
      />
      <ErrorNote message={list.error} />
      {list.loading && !list.data ? (
        <Empty>Cargando cuentas…</Empty>
      ) : rows.length === 0 ? (
        <Empty>{search ? "Nadie con ese correo o nombre." : "Todavía no se ha registrado nadie."}</Empty>
      ) : (
        <ul className="grid gap-2">
          {rows.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              me={session?.accountId === user.id}
              onGrant={onGrant}
              onChange={list.reload}
            />
          ))}
        </ul>
      )}
      {rows.length >= limit ? (
        <Button variant="outline" className="h-11" onClick={() => setLimit((v) => v + PAGE)}>
          Ver más
        </Button>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Borrar una cuenta o cambiar su correo se hace desde Supabase → Authentication → Users
        (no exponemos esa llave en la web). Para dar Pro, usa el botón: queda registrado como cobro.
      </p>
    </div>
  );
}
