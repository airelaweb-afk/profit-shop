// Webhook de Stripe → alta automática del socio Pro en Supabase.
//
// Eventos que escucha:
//   checkout.session.completed / checkout.session.async_payment_succeeded → nuevo cobro
//   charge.refunded                                                       → marca reembolsado
//
// Secretos necesarios (Dashboard → Edge Functions → Secrets, o `supabase secrets set`):
//   STRIPE_SECRET_KEY        sk_live_… (o sk_test_…)
//   STRIPE_WEBHOOK_SECRET    whsec_… del endpoint https://<proyecto>.supabase.co/functions/v1/stripe-webhook
//   PRO_MONTHS               opcional, meses por pago (12 por defecto)
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente.

import Stripe from "npm:stripe@17";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const proMonths = Number(Deno.env.get("PRO_MONTHS") ?? "12") || 12;

const stripe = new Stripe(stripeKey, {
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

type MembershipInsert = {
  email: string;
  name: string;
  method: "stripe";
  amount_cents: number;
  currency: string;
  months: number;
  starts_at: string;
  expires_at: string;
  status: "activo";
  source: "stripe";
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  stripe_customer_id: string | null;
  user_id: string | null;
  notes: string;
};

function addMonths(from: Date, months: number) {
  const d = new Date(from.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function handleCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return { skipped: "unpaid" };
  }
  const email = (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
  if (!email) return { skipped: "no-email" };

  const months = Number(session.metadata?.months ?? proMonths) || proMonths;
  const paidAt = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000);

  // Si el comprador ya tiene cuenta y Pro vigente, el nuevo periodo empieza al caducar el actual.
  let userId: string | null = isUuid(session.client_reference_id) ? session.client_reference_id : null;
  let currentUntil: Date | null = null;
  const { data: profile } = userId
    ? await supabase.from("profiles").select("id, pro_until").eq("id", userId).maybeSingle()
    : await supabase.from("profiles").select("id, pro_until").ilike("email", email).maybeSingle();
  if (profile) {
    userId = profile.id as string;
    currentUntil = profile.pro_until ? new Date(profile.pro_until as string) : null;
  }
  const start = currentUntil && currentUntil > paidAt ? currentUntil : paidAt;

  const row: MembershipInsert = {
    email,
    name: session.customer_details?.name ?? "",
    method: "stripe",
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? "eur",
    months,
    starts_at: paidAt.toISOString(),
    expires_at: addMonths(start, months).toISOString(),
    status: "activo",
    source: "stripe",
    stripe_session_id: session.id,
    stripe_payment_intent:
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
    user_id: userId,
    notes: "Alta automática desde Stripe.",
  };

  const { error } = await supabase
    .from("memberships")
    .upsert(row, { onConflict: "stripe_session_id", ignoreDuplicates: true });
  if (error) throw new Error(`memberships upsert: ${error.message}`);
  return { ok: true, email, userId };
}

async function handleRefund(charge: Stripe.Charge) {
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi) return { skipped: "no-payment-intent" };
  const { error } = await supabase
    .from("memberships")
    .update({ status: "reembolsado", notes: `Reembolso en Stripe (${charge.id}).` })
    .eq("stripe_payment_intent", pi);
  if (error) throw new Error(`memberships refund: ${error.message}`);
  return { ok: true, paymentIntent: pi };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Solo POST", { status: 405 });
  }
  if (!stripeKey || !webhookSecret) {
    return new Response("Faltan STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET", { status: 500 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Sin firma", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider);
  } catch (err) {
    return new Response(`Firma no válida: ${(err as Error).message}`, { status: 400 });
  }

  try {
    let result: unknown = { ignored: event.type };
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        result = await handleCheckout(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        result = await handleRefund(event.data.object as Stripe.Charge);
        break;
    }
    return Response.json({ received: true, type: event.type, result });
  } catch (err) {
    console.error(err);
    return new Response((err as Error).message, { status: 500 });
  }
});
