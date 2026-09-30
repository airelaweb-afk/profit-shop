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

export function hasRevolutPay() {
  return (
    REVOLUT_PAYMENT_LINK.startsWith("http") && REVOLUT_PAYMENT_LINK.length > 12
  );
}
