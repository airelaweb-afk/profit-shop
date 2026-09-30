import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Pega aquí la URL del proyecto si prefieres no usar variables de entorno. */
export const SUPABASE_URL_MANUAL = "";
/** Pega aquí la anon key (pública por diseño; las reglas RLS protegen los datos). */
export const SUPABASE_ANON_KEY_MANUAL = "";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || SUPABASE_URL_MANUAL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || SUPABASE_ANON_KEY_MANUAL;

/**
 * "Modo nube" = Supabase configurado. Sin él, la web funciona exactamente igual
 * que antes: cuentas y Pro viven en el navegador.
 */
export function hasCloud() {
  return SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
}

export type ProfileRow = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  pro_until: string | null;
  created_at: string;
  updated_at: string;
};

export type MembershipRow = {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  method: "stripe" | "revolut" | "bizum" | "transferencia" | "otro";
  amount_cents: number;
  currency: string;
  months: number;
  starts_at: string;
  expires_at: string;
  status: "activo" | "revocado" | "reembolsado";
  source: "admin" | "stripe";
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  stripe_customer_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  pro_until: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  memberships_count: number;
};

export type AdminStats = {
  users_total: number;
  users_7d: number;
  users_30d: number;
  pro_active: number;
  pro_expiring_30d: number;
  memberships_total: number;
  memberships_unlinked: number;
  revenue_cents: number;
  revenue_30d_cents: number;
  stripe_count: number;
  last_signup_at: string | null;
  last_payment_at: string | null;
};

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!hasCloud()) {
    throw new Error("Supabase no está configurado en esta web.");
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: "luna-oficio-supabase",
      },
    });
  }
  return client;
}

/** Traduce los errores más comunes de Supabase Auth a castellano. */
export function authErrorMessage(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) {
    return "Confirma tu correo primero: te hemos enviado un enlace.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Ya hay una cuenta con ese correo. Entra o recupera la contraseña.";
  }
  if (m.includes("password should be at least")) {
    return "La contraseña tiene que tener al menos 8 caracteres.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Demasiados intentos seguidos. Espera un minuto.";
  }
  if (m.includes("failed to fetch") || m.includes("networkerror")) {
    return "No hay conexión con el servidor de cuentas. Revisa tu internet.";
  }
  if (m.includes("invalid email") || m.includes("unable to validate email")) {
    return "El correo no parece válido.";
  }
  if (m.includes("same password")) return "La nueva contraseña es igual que la anterior.";
  if (m.includes("session") && m.includes("missing")) {
    return "La sesión ha caducado. Vuelve a entrar.";
  }
  return message;
}
