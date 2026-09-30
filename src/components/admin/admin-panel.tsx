"use client";

import { useState } from "react";
import { AdminAccounts } from "@/components/admin/admin-accounts";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminKeys } from "@/components/admin/admin-keys";
import { AdminMembers } from "@/components/admin/admin-members";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminSettings } from "@/components/admin/admin-settings";
import { CloudAccounts } from "@/components/admin/cloud-accounts";
import { CloudGate } from "@/components/admin/cloud-gate";
import { CloudMembers } from "@/components/admin/cloud-members";
import { CloudOverview } from "@/components/admin/cloud-overview";
import { CloudSettings } from "@/components/admin/cloud-settings";
import { Button } from "@/components/ui/button";
import { hasAdminAccess, isAdminUnlocked, lockAdmin } from "@/lib/admin";
import { logoutAccount } from "@/lib/auth";
import { hasCloud } from "@/lib/supabase";
import { useAdminTick } from "@/lib/use-admin";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "socios", label: "Socios Pro" },
  { id: "cuentas", label: "Cuentas" },
  { id: "claves", label: "Claves" },
  { id: "ajustes", label: "Ajustes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Tabs({
  tab,
  onTab,
  onClose,
}: {
  tab: TabId;
  onTab: (tab: TabId) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-foreground pb-3">
      <nav className="flex flex-wrap gap-1" aria-label="Secciones del panel">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTab(item.id)}
            className={`h-10 rounded-[2px] px-3 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            aria-current={tab === item.id ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <Button variant="ghost" className="h-10" onClick={onClose}>
        Cerrar
      </Button>
    </div>
  );
}

function CloudPanel() {
  const [tab, setTab] = useState<TabId>("resumen");
  const [prefill, setPrefill] = useState<{ email: string; name: string } | undefined>();

  return (
    <CloudGate>
      <div className="mt-6">
        <Tabs tab={tab} onTab={setTab} onClose={() => logoutAccount()} />
        <div className="mt-6">
          {tab === "resumen" ? <CloudOverview /> : null}
          {tab === "socios" ? <CloudMembers key={prefill?.email ?? ""} prefill={prefill} /> : null}
          {tab === "cuentas" ? (
            <CloudAccounts
              onGrant={(user) => {
                setPrefill({ email: user.email, name: user.name });
                setTab("socios");
              }}
            />
          ) : null}
          {tab === "claves" ? <AdminKeys /> : null}
          {tab === "ajustes" ? <CloudSettings /> : null}
        </div>
      </div>
    </CloudGate>
  );
}

function LocalPanel() {
  const [tab, setTab] = useState<TabId>("resumen");
  const access = hasAdminAccess();
  if (!access || !isAdminUnlocked()) {
    return <AdminGate hasAccess={access} />;
  }

  return (
    <div className="mt-6">
      <Tabs tab={tab} onTab={setTab} onClose={() => lockAdmin()} />
      <div className="mt-6">
        {tab === "resumen" ? <AdminOverview /> : null}
        {tab === "socios" ? <AdminMembers /> : null}
        {tab === "cuentas" ? <AdminAccounts /> : null}
        {tab === "claves" ? <AdminKeys /> : null}
        {tab === "ajustes" ? <AdminSettings /> : null}
      </div>
    </div>
  );
}

export function AdminPanel() {
  const tick = useAdminTick();

  if (tick < 0) {
    return (
      <p className="mt-8 rounded-[2px] bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/15">
        Abriendo el panel…
      </p>
    );
  }

  return hasCloud() ? <CloudPanel /> : <LocalPanel />;
}
