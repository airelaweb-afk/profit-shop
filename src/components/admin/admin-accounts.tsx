"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteAccount,
  listAccounts,
  resetAccountPassword,
  type AccountSummary,
} from "@/lib/auth";
import { useSession } from "@/lib/use-session";
import { formatIsoEs } from "@/lib/use-admin";

function AccountRow({ account, current }: { account: AccountSummary; current: boolean }) {
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <li className="rounded-[2px] bg-card p-4 ring-1 ring-foreground/15">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading text-lg">
            {account.name}
            {current ? (
              <span className="ml-2 font-mono text-[0.65rem] tracking-widest text-primary uppercase">
                sesión abierta
              </span>
            ) : null}
          </p>
          <p className="text-sm text-muted-foreground">
            {account.email} · alta {formatIsoEs(account.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-10" onClick={() => setResetting((v) => !v)}>
            Nueva contraseña
          </Button>
          <Button
            variant="ghost"
            className="h-10 text-destructive"
            onClick={() => {
              if (confirm(`¿Borrar la cuenta de ${account.email} de este navegador?`)) {
                deleteAccount(account.id);
              }
            }}
          >
            Borrar
          </Button>
        </div>
      </div>
      {resetting ? (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            setMsg("");
            try {
              await resetAccountPassword(account.id, password);
              setMsg("Contraseña cambiada.");
              setPassword("");
              setResetting(false);
            } catch (caught) {
              setMsg(caught instanceof Error ? caught.message : "No se pudo cambiar.");
            }
          }}
        >
          <Input
            type="password"
            className="h-11"
            placeholder="Nueva contraseña (mín. 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" className="h-11">
            Guardar
          </Button>
        </form>
      ) : null}
      {msg ? <p className="mt-2 text-sm text-muted-foreground">{msg}</p> : null}
    </li>
  );
}

export function AdminAccounts() {
  const accounts = listAccounts();
  const session = useSession();
  return (
    <div className="grid gap-6">
      <div className="rounded-[2px] bg-accent p-4 text-sm text-accent-foreground">
        Estas son las cuentas gratuitas creadas en <strong>este</strong> navegador. Las
        de otros aparatos no existen en ningún servidor nuestro: no se pueden listar. Los
        socios de pago están en la pestaña Socios.
      </div>
      {accounts.length === 0 ? (
        <p className="rounded-[2px] bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/15">
          No hay cuentas en este navegador.
        </p>
      ) : (
        <ul className="grid gap-2">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              current={session?.accountId === account.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
