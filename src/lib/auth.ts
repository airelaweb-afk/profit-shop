import { newId } from "@/lib/quotes";

const ACCOUNTS_KEY = "luna-oficio-accounts";
const SESSION_KEY = "luna-oficio-session";

export type AccountRecord = {
  id: string;
  name: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
};

export type Session = {
  accountId: string;
  name: string;
  email: string;
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function bytesToB64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function b64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToB64(bytes);
}

async function deriveHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: b64ToBytes(salt),
      iterations: 100_000,
    },
    key,
    256,
  );
  return bytesToB64(new Uint8Array(bits));
}

function readAccounts(): AccountRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AccountRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: AccountRecord[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getSessionSnapshot() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SESSION_KEY) ?? "";
}

export function getSessionServerSnapshot() {
  return "";
}

export function parseSession(json: string): Session | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as Session;
    if (!parsed?.accountId || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  emit();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  if (name.length < 2) throw new Error("Escribe tu nombre.");
  if (!email.includes("@")) throw new Error("El correo no parece válido.");
  if (password.length < 8) {
    throw new Error("La contraseña tiene que tener al menos 8 caracteres.");
  }
  const accounts = readAccounts();
  if (accounts.some((item) => item.email === email)) {
    throw new Error("Ya hay una cuenta con ese correo en este navegador.");
  }
  const salt = randomSalt();
  const hash = await deriveHash(password, salt);
  const account: AccountRecord = {
    id: newId(),
    name,
    email,
    salt,
    hash,
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  writeSession({ accountId: account.id, name: account.name, email: account.email });
}

export async function loginAccount(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const account = readAccounts().find((item) => item.email === email);
  if (!account) {
    throw new Error("No hay ninguna cuenta con ese correo en este navegador.");
  }
  const hash = await deriveHash(input.password, account.salt);
  if (hash !== account.hash) throw new Error("Contraseña incorrecta.");
  writeSession({
    accountId: account.id,
    name: account.name,
    email: account.email,
  });
}

export function logoutAccount() {
  writeSession(null);
}
