"use client";

import {
  authErrorMessage,
  hasCloud,
  supabase,
  type AdminStats,
  type AdminUserRow,
  type MembershipRow,
  type ProfileRow,
} from "@/lib/supabase";

const PROFILE_KEY = "luna-oficio-profile";
const listeners = new Set<() => void>();
let recoveryMode = false;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeProfile(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProfileSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(PROFILE_KEY) ?? "";
}

export function parseProfile(json: string): ProfileRow | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as ProfileRow;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
}

export function profileIsPro(profile: ProfileRow | null) {
  if (!profile?.pro_until) return false;
  return new Date(profile.pro_until).getTime() > Date.now();
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  emit();
}

export async function refreshProfile(): Promise<ProfileRow | null> {
  if (!hasCloud()) return null;
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) {
    clearProfile();
    return null;
  }
  const { data, error } = await supabase()
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error || !data) return parseProfile(getProfileSnapshot());
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
  emit();
  return data as ProfileRow;
}

/** Marca que el usuario llega desde un enlace de "recuperar contraseña". */
export function setRecoveryMode(value: boolean) {
  recoveryMode = value;
  emit();
}

export function getRecoverySnapshot() {
  return recoveryMode;
}

function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(authErrorMessage(error.message));
}

export async function cloudForgotPassword(email: string) {
  const clean = email.trim().toLowerCase();
  if (!clean.includes("@")) throw new Error("Escribe el correo de tu cuenta.");
  const { error } = await supabase().auth.resetPasswordForEmail(clean, {
    redirectTo: `${window.location.origin}/cuenta/?recuperar=1`,
  });
  fail(error);
}

export async function cloudUpdatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("La contraseña tiene que tener al menos 8 caracteres.");
  }
  const { error } = await supabase().auth.updateUser({ password });
  fail(error);
  setRecoveryMode(false);
}

export async function cloudUpdateName(name: string) {
  const clean = name.trim();
  if (clean.length < 2) throw new Error("Escribe tu nombre.");
  const { data: auth } = await supabase().auth.getUser();
  if (!auth.user) throw new Error("La sesión ha caducado. Vuelve a entrar.");
  const { error } = await supabase().from("profiles").update({ name: clean }).eq("id", auth.user.id);
  fail(error);
  await supabase().auth.updateUser({ data: { name: clean } });
  await refreshProfile();
}

export async function myMemberships(): Promise<MembershipRow[]> {
  const { data, error } = await supabase().rpc("my_memberships");
  fail(error);
  return (data ?? []) as MembershipRow[];
}

// ---------------------------------------------------------------------------
// Administración (todas las RPC comprueban is_admin() en la base de datos)
// ---------------------------------------------------------------------------

export async function adminStats(): Promise<AdminStats> {
  const { data, error } = await supabase().rpc("admin_stats");
  fail(error);
  return data as AdminStats;
}

export async function adminListUsers(search = "", limit = 50, offset = 0): Promise<AdminUserRow[]> {
  const { data, error } = await supabase().rpc("admin_list_users", {
    p_search: search.trim(),
    p_limit: limit,
    p_offset: offset,
  });
  fail(error);
  return (data ?? []) as AdminUserRow[];
}

export async function adminListMemberships(options: {
  search?: string;
  status?: MembershipRow["status"] | "todos";
  limit?: number;
} = {}): Promise<MembershipRow[]> {
  let query = supabase()
    .from("memberships")
    .select("*")
    .order("starts_at", { ascending: false })
    .limit(options.limit ?? 200);
  const search = options.search?.trim();
  if (search) {
    const like = `%${search.replace(/[%_]/g, "")}%`;
    query = query.or(`email.ilike.${like},name.ilike.${like},notes.ilike.${like}`);
  }
  if (options.status && options.status !== "todos") {
    query = query.eq("status", options.status);
  }
  const { data, error } = await query;
  fail(error);
  return (data ?? []) as MembershipRow[];
}

export async function adminGrantPro(input: {
  email: string;
  name: string;
  method: MembershipRow["method"];
  amount: number;
  months: number;
  paidAt: string;
  notes: string;
}): Promise<MembershipRow> {
  const { data, error } = await supabase().rpc("admin_grant_pro", {
    p_email: input.email.trim().toLowerCase(),
    p_name: input.name.trim(),
    p_method: input.method,
    p_amount_cents: Math.round(input.amount * 100),
    p_months: input.months,
    p_paid_at: input.paidAt ? new Date(input.paidAt).toISOString() : new Date().toISOString(),
    p_notes: input.notes.trim(),
  });
  fail(error);
  return data as MembershipRow;
}

export async function adminSetMembershipStatus(id: string, status: MembershipRow["status"]) {
  const { error } = await supabase().from("memberships").update({ status }).eq("id", id);
  fail(error);
}

export async function adminUpdateMembershipNotes(id: string, notes: string) {
  const { error } = await supabase().from("memberships").update({ notes }).eq("id", id);
  fail(error);
}

export async function adminDeleteMembership(id: string) {
  const { error } = await supabase().from("memberships").delete().eq("id", id);
  fail(error);
}

export async function adminSetAdmin(userId: string, admin: boolean) {
  const { error } = await supabase().rpc("admin_set_admin", { p_user: userId, p_admin: admin });
  fail(error);
}

export type CloudNote = { id: string; text: string; done: boolean; created_at: string };

export async function adminListNotes(): Promise<CloudNote[]> {
  const { data, error } = await supabase()
    .from("admin_notes")
    .select("*")
    .order("created_at", { ascending: false });
  fail(error);
  return (data ?? []) as CloudNote[];
}

export async function adminAddNote(text: string) {
  const clean = text.trim();
  if (!clean) return;
  const { error } = await supabase().from("admin_notes").insert({ text: clean });
  fail(error);
}

export async function adminToggleNote(id: string, done: boolean) {
  const { error } = await supabase().from("admin_notes").update({ done }).eq("id", id);
  fail(error);
}

export async function adminDeleteNote(id: string) {
  const { error } = await supabase().from("admin_notes").delete().eq("id", id);
  fail(error);
}

export function membershipsToCsv(rows: MembershipRow[]) {
  const head = [
    "estado", "nombre", "correo", "metodo", "origen", "importe_eur", "meses",
    "pagado", "caduca", "notas",
  ];
  const lines = rows.map((m) =>
    [
      m.status,
      m.name,
      m.email,
      m.method,
      m.source,
      (m.amount_cents / 100).toFixed(2).replace(".", ","),
      String(m.months),
      m.starts_at.slice(0, 10),
      m.expires_at.slice(0, 10),
      m.notes,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(";"),
  );
  return [head.join(";"), ...lines].join("\n");
}
