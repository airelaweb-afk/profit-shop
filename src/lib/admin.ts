"use client";

import { deriveHash, randomSalt } from "@/lib/auth";
import { newId } from "@/lib/quotes";
import {
  formatExpiry,
  generateSigningPair,
  publicFromPrivate,
  randomSerial,
  signProKey,
} from "@/lib/pro-keys";

const ACCESS_KEY = "luna-oficio-admin-access";
const SESSION_KEY = "luna-oficio-admin-session";
const SIGNING_KEY = "luna-oficio-admin-signing";
const LEDGER_KEY = "luna-oficio-admin-ledger";
const NOTES_KEY = "luna-oficio-admin-notes";

export type MemberStatus = "activo" | "revocado" | "reembolsado";
export type PayMethod = "stripe" | "revolut" | "bizum" | "transferencia" | "otro";

export type Member = {
  id: string;
  name: string;
  email: string;
  method: PayMethod;
  amount: number;
  paidAt: string;
  serial: string;
  expires: string;
  key: string;
  notes: string;
  status: MemberStatus;
  createdAt: string;
  renewedFrom?: string;
};

export type AdminNote = {
  id: string;
  text: string;
  createdAt: string;
  done: boolean;
};

type AdminAccess = { salt: string; hash: string; createdAt: string };

type AdminBackup = {
  kind: "luna-oficio-admin-backup";
  version: 1;
  exportedAt: string;
  ledger: Member[];
  notes: AdminNote[];
  signing?: JsonWebKey;
};

const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version += 1;
  for (const listener of listeners) listener();
}

export function subscribeAdmin(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAdminVersion() {
  if (typeof window === "undefined") return -1;
  return version;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

/* Acceso */

export function hasAdminAccess() {
  return read<AdminAccess | null>(ACCESS_KEY, null) !== null;
}

export function isAdminUnlocked() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

export async function createAdminAccess(password: string) {
  if (password.length < 10) {
    throw new Error("Pon al menos 10 caracteres. Es la llave de tu panel.");
  }
  if (hasAdminAccess()) throw new Error("Ya hay un acceso creado en este navegador.");
  const salt = randomSalt();
  const hash = await deriveHash(password, salt);
  window.localStorage.setItem(
    ACCESS_KEY,
    JSON.stringify({ salt, hash, createdAt: new Date().toISOString() }),
  );
  window.sessionStorage.setItem(SESSION_KEY, "1");
  emit();
}

export async function unlockAdmin(password: string) {
  const access = read<AdminAccess | null>(ACCESS_KEY, null);
  if (!access) throw new Error("No hay acceso creado en este navegador.");
  const hash = await deriveHash(password, access.salt);
  if (hash !== access.hash) throw new Error("Contraseña incorrecta.");
  window.sessionStorage.setItem(SESSION_KEY, "1");
  emit();
}

export function lockAdmin() {
  window.sessionStorage.removeItem(SESSION_KEY);
  emit();
}

export async function changeAdminPassword(current: string, next: string) {
  await unlockAdmin(current);
  if (next.length < 10) throw new Error("Pon al menos 10 caracteres.");
  const salt = randomSalt();
  const hash = await deriveHash(next, salt);
  write(ACCESS_KEY, { salt, hash, createdAt: new Date().toISOString() });
}

/* Clave de firma */

export function getSigningKey() {
  return read<JsonWebKey | null>(SIGNING_KEY, null);
}

export function getPublicJwkString() {
  const priv = getSigningKey();
  return priv ? JSON.stringify(publicFromPrivate(priv)) : "";
}

export async function createSigningKey() {
  if (getSigningKey()) {
    throw new Error("Ya hay una clave de firma. Expórtala antes de sustituirla.");
  }
  const { privateJwk } = await generateSigningPair();
  write(SIGNING_KEY, privateJwk);
  return privateJwk;
}

export function importSigningKey(json: string) {
  let jwk: JsonWebKey;
  try {
    jwk = JSON.parse(json) as JsonWebKey;
  } catch {
    throw new Error("Eso no es un JWK válido.");
  }
  if (jwk.kty !== "EC" || jwk.crv !== "P-256" || !jwk.d || !jwk.x || !jwk.y) {
    throw new Error("Hace falta la clave PRIVADA (EC P-256 con campo d).");
  }
  write(SIGNING_KEY, jwk);
}

export function replaceSigningKey() {
  window.localStorage.removeItem(SIGNING_KEY);
  emit();
}

/* Libro de socios */

export function listMembers(): Member[] {
  return read<Member[]>(LEDGER_KEY, []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

function saveMembers(members: Member[]) {
  write(LEDGER_KEY, members);
}

export async function issueMember(input: {
  name: string;
  email: string;
  method: PayMethod;
  amount: number;
  months: number;
  notes: string;
  paidAt?: string;
  renewedFrom?: string;
}) {
  const priv = getSigningKey();
  if (!priv) {
    throw new Error("Primero crea la clave de firma en la pestaña Claves.");
  }
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) throw new Error("Escribe el nombre del socio.");
  if (!email.includes("@")) throw new Error("El correo no parece válido.");
  if (!(input.months >= 1 && input.months <= 60)) {
    throw new Error("Meses entre 1 y 60.");
  }
  const expiresAt = new Date();
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + input.months);
  const serial = randomSerial();
  const key = await signProKey(priv, serial, expiresAt);
  const member: Member = {
    id: newId(),
    name,
    email,
    method: input.method,
    amount: Number.isFinite(input.amount) ? input.amount : 0,
    paidAt: input.paidAt || new Date().toISOString().slice(0, 10),
    serial,
    expires: formatExpiry(expiresAt),
    key,
    notes: input.notes.trim(),
    status: "activo",
    createdAt: new Date().toISOString(),
    renewedFrom: input.renewedFrom,
  };
  saveMembers([member, ...listMembers()]);
  return member;
}

export function setMemberStatus(id: string, status: MemberStatus) {
  saveMembers(
    listMembers().map((item) => (item.id === id ? { ...item, status } : item)),
  );
}

export function updateMemberNotes(id: string, notes: string) {
  saveMembers(
    listMembers().map((item) => (item.id === id ? { ...item, notes } : item)),
  );
}

export function deleteMember(id: string) {
  saveMembers(listMembers().filter((item) => item.id !== id));
}

export function expiryDate(expires: string) {
  const y = Number(expires.slice(0, 4));
  const m = Number(expires.slice(4, 6));
  const d = Number(expires.slice(6, 8));
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
}

export function memberIsCurrent(member: Member, now = Date.now()) {
  return member.status === "activo" && expiryDate(member.expires).getTime() > now;
}

export function memberExpiresSoon(member: Member, days = 30, now = Date.now()) {
  if (!memberIsCurrent(member, now)) return false;
  const left = expiryDate(member.expires).getTime() - now;
  return left < days * 86_400_000;
}

/* Notas / pendientes */

export function listNotes(): AdminNote[] {
  return read<AdminNote[]>(NOTES_KEY, []);
}

export function addNote(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;
  write(NOTES_KEY, [
    { id: newId(), text: trimmed, createdAt: new Date().toISOString(), done: false },
    ...listNotes(),
  ]);
}

export function toggleNote(id: string) {
  write(
    NOTES_KEY,
    listNotes().map((note) => (note.id === id ? { ...note, done: !note.done } : note)),
  );
}

export function deleteNote(id: string) {
  write(NOTES_KEY, listNotes().filter((note) => note.id !== id));
}

/* Copias */

export function exportBackup(includeSigning: boolean): string {
  const backup: AdminBackup = {
    kind: "luna-oficio-admin-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    ledger: listMembers(),
    notes: listNotes(),
    signing: includeSigning ? getSigningKey() ?? undefined : undefined,
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackup(json: string) {
  let parsed: AdminBackup;
  try {
    parsed = JSON.parse(json) as AdminBackup;
  } catch {
    throw new Error("El archivo no es una copia válida.");
  }
  if (parsed.kind !== "luna-oficio-admin-backup") {
    throw new Error("El archivo no es una copia de este panel.");
  }
  const current = listMembers();
  const known = new Set(current.map((item) => item.id));
  const merged = [...current, ...(parsed.ledger ?? []).filter((item) => !known.has(item.id))];
  window.localStorage.setItem(LEDGER_KEY, JSON.stringify(merged));
  const notes = listNotes();
  const knownNotes = new Set(notes.map((note) => note.id));
  window.localStorage.setItem(
    NOTES_KEY,
    JSON.stringify([...notes, ...(parsed.notes ?? []).filter((n) => !knownNotes.has(n.id))]),
  );
  if (parsed.signing && !getSigningKey()) {
    window.localStorage.setItem(SIGNING_KEY, JSON.stringify(parsed.signing));
  }
  emit();
  return { members: merged.length - current.length };
}

export function wipeAdmin() {
  for (const key of [ACCESS_KEY, SIGNING_KEY, LEDGER_KEY, NOTES_KEY]) {
    window.localStorage.removeItem(key);
  }
  window.sessionStorage.removeItem(SESSION_KEY);
  emit();
}

export function membersToCsv(members: Member[]) {
  const header = [
    "nombre",
    "correo",
    "metodo",
    "importe",
    "pagado",
    "serial",
    "caduca",
    "estado",
    "clave",
    "notas",
  ];
  const rows = members.map((m) =>
    [
      m.name,
      m.email,
      m.method,
      m.amount.toFixed(2).replace(".", ","),
      m.paidAt,
      m.serial,
      `${m.expires.slice(6, 8)}/${m.expires.slice(4, 6)}/${m.expires.slice(0, 4)}`,
      m.status,
      m.key,
      m.notes,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(";"),
  );
  return [header.join(";"), ...rows].join("\n");
}

export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
