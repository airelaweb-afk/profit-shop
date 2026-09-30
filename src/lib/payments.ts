/** Pega aquí tu Payment Link de Stripe (Dashboard → Payment links → copiar URL). */
export const STRIPE_PAYMENT_LINK_MANUAL = "";

/** Pega aquí tu enlace de Revolut (revolut.me/usuario o pago solicitado). */
export const REVOLUT_PAYMENT_LINK_MANUAL = "";

export const STRIPE_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK?.trim() ||
  STRIPE_PAYMENT_LINK_MANUAL;

export const REVOLUT_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_REVOLUT_PAYMENT_LINK?.trim() ||
  REVOLUT_PAYMENT_LINK_MANUAL;

export const PRO_PRICE = "29 €";
export const PRO_PERIOD = "año";

export function hasStripePay() {
  return STRIPE_PAYMENT_LINK.startsWith("http") && STRIPE_PAYMENT_LINK.length > 12;
}

/**
 * Payment Link de Stripe con el comprador prellenado. `client_reference_id`
 * llega al webhook y enlaza el cobro con la cuenta sin depender del correo.
 */
export function stripeCheckoutUrl(account?: { id: string; email: string } | null) {
  if (!hasStripePay() || !account) return STRIPE_PAYMENT_LINK;
  const url = new URL(STRIPE_PAYMENT_LINK);
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
