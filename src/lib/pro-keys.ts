/**
 * Claves Pro firmadas con ECDSA P-256. El administrador firma en su navegador
 * (clave privada nunca sale de allí); la web verifica con la clave pública.
 * Formato: LUNA-<SERIAL>-<YYYYMMDD>-<firma base64url>
 */

/** Pega aquí la clave pública (JWK) que te da /admin, o usa NEXT_PUBLIC_PRO_PUBLIC_KEY. */
export const PRO_PUBLIC_KEY_MANUAL = "";

/** Seriales revocados, separados por coma. También NEXT_PUBLIC_PRO_REVOKED. */
export const PRO_REVOKED_MANUAL = "";

/** Clave maestra de pruebas. Solo vale mientras no haya clave pública configurada. */
export const LEGACY_MASTER_KEY = "LUNA-OFICIO-PRO";

const PUBLIC_KEY_RAW =
  process.env.NEXT_PUBLIC_PRO_PUBLIC_KEY?.trim() || PRO_PUBLIC_KEY_MANUAL;

const REVOKED = new Set(
  (process.env.NEXT_PUBLIC_PRO_REVOKED?.trim() || PRO_REVOKED_MANUAL)
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean),
);

const SERIAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type ProKeyInfo = {
  serial: string;
  expires: string;
  expiresAt: Date;
  revoked: boolean;
  legacy: boolean;
};

export function hasPublicKey() {
  return PUBLIC_KEY_RAW.length > 0;
}

export function publicKeyJwk(): JsonWebKey | null {
  if (!PUBLIC_KEY_RAW) return null;
  try {
    return JSON.parse(PUBLIC_KEY_RAW) as JsonWebKey;
  } catch {
    return null;
  }
}

export function isRevoked(serial: string) {
  return REVOKED.has(serial.toUpperCase());
}

export function revokedSerials() {
  return [...REVOKED];
}

function b64url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function randomSerial() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += SERIAL_ALPHABET[byte % SERIAL_ALPHABET.length];
  return out;
}

export function formatExpiry(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function parseExpiry(value: string) {
  if (!/^\d{8}$/.test(value)) return null;
  const y = Number(value.slice(0, 4));
  const m = Number(value.slice(4, 6));
  const d = Number(value.slice(6, 8));
  const date = new Date(Date.UTC(y, m - 1, d, 23, 59, 59));
  return Number.isNaN(date.getTime()) ? null : date;
}

function payload(serial: string, expires: string) {
  return `LUNA-${serial}-${expires}`;
}

const KEY_PATTERN = /^LUNA-([A-Za-z2-9]{6})-(\d{8})-([A-Za-z0-9_-]{40,})$/;

export function normalizeKey(code: string) {
  return code.trim().replace(/\s+/g, "");
}

export function parseKey(code: string) {
  const match = KEY_PATTERN.exec(normalizeKey(code).replace(/^luna-/i, "LUNA-"));
  if (!match) return null;
  const serial = match[1].toUpperCase();
  const expires = match[2];
  const signature = match[3];
  if (!/^[A-Z2-9]{6}$/.test(serial)) return null;
  if (!parseExpiry(expires)) return null;
  return { serial, expires, signature };
}

export async function generateSigningPair() {
  const pair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  );
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  delete publicJwk.d;
  publicJwk.key_ops = ["verify"];
  return { privateJwk, publicJwk };
}

export function publicFromPrivate(privateJwk: JsonWebKey): JsonWebKey {
  const { kty, crv, x, y } = privateJwk;
  return { kty, crv, x, y, ext: true, key_ops: ["verify"] };
}

export async function signProKey(
  privateJwk: JsonWebKey,
  serial: string,
  expiresAt: Date,
) {
  const key = await crypto.subtle.importKey(
    "jwk",
    { ...privateJwk, key_ops: ["sign"] },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  const expires = formatExpiry(expiresAt);
  const data = new TextEncoder().encode(payload(serial, expires));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, data);
  return `${payload(serial, expires)}-${b64url(new Uint8Array(sig))}`;
}

export async function verifyWithJwk(code: string, jwk: JsonWebKey): Promise<ProKeyInfo | null> {
  const parsed = parseKey(code);
  if (!parsed) return null;
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "jwk",
      { ...jwk, key_ops: ["verify"] },
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"],
    );
  } catch {
    return null;
  }
  const data = new TextEncoder().encode(payload(parsed.serial, parsed.expires));
  let ok = false;
  try {
    ok = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      fromB64url(parsed.signature),
      data,
    );
  } catch {
    ok = false;
  }
  if (!ok) return null;
  const expiresAt = parseExpiry(parsed.expires)!;
  return {
    serial: parsed.serial,
    expires: parsed.expires,
    expiresAt,
    revoked: isRevoked(parsed.serial),
    legacy: false,
  };
}

/** Verifica una clave contra la clave pública del sitio (o la maestra de pruebas si no hay). */
export async function verifyProKey(code: string): Promise<ProKeyInfo | null> {
  const jwk = publicKeyJwk();
  if (!jwk) {
    if (code.trim().toUpperCase().replace(/\s+/g, "") === LEGACY_MASTER_KEY) {
      const expiresAt = new Date(Date.UTC(2099, 11, 31, 23, 59, 59));
      return {
        serial: "MASTER",
        expires: formatExpiry(expiresAt),
        expiresAt,
        revoked: false,
        legacy: true,
      };
    }
    return null;
  }
  return verifyWithJwk(code, jwk);
}
