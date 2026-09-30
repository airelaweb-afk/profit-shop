/** Payment Link anual (Dashboard → Payment links). 40 € / 12 meses. */
export const STRIPE_PAYMENT_LINK_MANUAL = "";

/** Payment Link mensual. 7 € / 1 mes. */
export const STRIPE_PAYMENT_LINK_MONTHLY_MANUAL = "";

/** Revolut (revolut.me/usuario o pago solicitado). */
export const REVOLUT_PAYMENT_LINK_MANUAL = "";

export const STRIPE_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() ||
  STRIPE_PAYMENT_LINK_MANUAL;

export const STRIPE_PAYMENT_LINK_MONTHLY =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY?.trim() ||
  STRIPE_PAYMENT_LINK_MONTHLY_MANUAL;

export const REVOLUT_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_REVOLUT_PAYMENT_LINK?.trim() ||
  REVOLUT_PAYMENT_LINK_MANUAL;

export const PRO_MONTHLY = "7 €";
export const PRO_YEARLY = "40 €";
export const PRO_PRICE = PRO_YEARLY;
export const PRO_PERIOD = "año";

export type PayPlan = "month" | "year";

export function hasStripePay() {
  return STRIPE_PAYMENT_LINK.startsWith("http") && STRIPE_PAYMENT_LINK.length > 12;
}

export function hasStripeMonthlyPay() {
  return (
    STRIPE_PAYMENT_LINK_MONTHLY.startsWith("http") &&
    STRIPE_PAYMENT_LINK_MONTHLY.length > 12
  );
}

export function stripeLinkFor(plan: PayPlan) {
  if (plan === "month") return STRIPE_PAYMENT_LINK_MONTHLY;
  return STRIPE_PAYMENT_LINK;
}

/**
 * Payment Link de Stripe con el comprador prellenado. `client_reference_id`
 * llega al webhook y enlaza el cobro con la cuenta sin depender del correo.
 * En el Payment Link mensual, pon metadata `months=1`; en el anual, `months=12`.
 */
export function stripeCheckoutUrl(
  account?: { id: string; email: string } | null,
  plan: PayPlan = "year",
) {
  const base = stripeLinkFor(plan);
  if (!base.startsWith("http") || !account) return base;
  const url = new URL(base);
  if (account.email) url.searchParams.set("prefilled_email", account.email);
  if (/^[0-9a-f-]{36}$/i.test(account.id)) {
    url.searchParams.set("client_reference_id", account.id);
  }
  return url.toString();
}

export function hasRevolutPay() {
  return (
    REVOLUT_PAYMENT_LINK.startsWith("http") && REVOLUT_PAYMENT_LINK.length > 12
  );
}
