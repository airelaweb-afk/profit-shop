import { clearProfile, refreshProfile, setRecoveryMode } from "@/lib/cloud";
import { newId } from "@/lib/quotes";
import { authErrorMessage, hasCloud, supabase } from "@/lib/supabase";

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
  /** true cuando la sesión viene de Supabase (vale en cualquier aparato). */
  cloud?: boolean;
};

export type RegisterResult = { needsConfirmation: boolean };

const listeners = new Set<() => void>();
let authVersion = 0;

function emit() {
  authVersion += 1;
  for (const listener of listeners) listener();
}

export function getAuthVersion() {
  if (typeof window === "undefined") return -1;
  return authVersion;
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

export function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToB64(bytes);
}

export async function deriveHash(password: string, salt: string) {
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

// ---------------------------------------------------------------------------
// Modo nube (Supabase): la sesión real la lleva supabase-js; aquí se guarda una
// copia mínima para que el header y las puertas pinten sin esperar a la red.
// ---------------------------------------------------------------------------

let cloudInitialised = false;

type CloudUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

function cacheCloudSession(user: CloudUser) {
  const cached = parseSession(getSessionSnapshot());
  const metaName = user.user_metadata?.name;
  const next: Session = {
    accountId: user.id,
    name:
      (typeof metaName === "string" && metaName) ||
      cached?.name ||
      user.email?.split("@")[0] ||
      "",
    email: user.email ?? cached?.email ?? "",
    cloud: true,
  };
  if (JSON.stringify(next) !== getSessionSnapshot()) writeSession(next);
}

export function initCloudAuth() {
  if (cloudInitialised || typeof window === "undefined" || !hasCloud()) return;
  cloudInitialised = true;
  supabase().auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    if (session?.user) {
      cacheCloudSession(session.user);
      if (event !== "TOKEN_REFRESHED") {
        // Fuera del callback: supabase-js recomienda no esperar peticiones aquí.
        setTimeout(() => void refreshProfile(), 0);
      }
    } else if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") {
      if (getSessionSnapshot()) writeSession(null);
      clearProfile();
    }
  });
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const password = input.password;
  if (name.length < 2) throw new Error("Escribe tu nombre.");
  if (!email.includes("@")) throw new Error("El correo no parece válido.");
  if (password.length < 8) {
    throw new Error("La contraseña tiene que tener al menos 8 caracteres.");
  }
  if (hasCloud()) {
    const { data, error } = await supabase().auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/entrar/?confirmado=1`,
      },
    });
    if (error) throw new Error(authErrorMessage(error.message));
    // Con "confirmar correo" activado, Supabase devuelve usuario sin sesión.
    if (!data.session) return { needsConfirmation: true };
    if (data.user) cacheCloudSession(data.user);
    return { needsConfirmation: false };
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
  return { needsConfirmation: false };
}

export async function loginAccount(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  if (hasCloud()) {
    const { data, error } = await supabase().auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error) throw new Error(authErrorMessage(error.message));
    if (data.user) cacheCloudSession(data.user);
    return;
  }
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
  if (hasCloud()) {
    clearProfile();
    void supabase().auth.signOut();
  }
}

export type AccountSummary = Pick<AccountRecord, "id" | "name" | "email" | "createdAt">;

export function listAccounts(): AccountSummary[] {
  return readAccounts()
    .map(({ id, name, email, createdAt }) => ({ id, name, email, createdAt }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteAccount(id: string) {
  const accounts = readAccounts();
  writeAccounts(accounts.filter((item) => item.id !== id));
  const session = parseSession(getSessionSnapshot());
  if (session?.accountId === id) writeSession(null);
  else emit();
}

export async function resetAccountPassword(id: string, password: string) {
  if (password.length < 8) {
    throw new Error("La contraseña tiene que tener al menos 8 caracteres.");
  }
  const accounts = readAccounts();
  const account = accounts.find((item) => item.id === id);
  if (!account) throw new Error("Esa cuenta ya no está en este navegador.");
  const salt = randomSalt();
  const hash = await deriveHash(password, salt);
  writeAccounts(
    accounts.map((item) => (item.id === id ? { ...item, salt, hash } : item)),
  );
  emit();
}
