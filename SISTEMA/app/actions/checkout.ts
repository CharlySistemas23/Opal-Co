"use server";

import Stripe from "stripe";
import { safeEnv } from "@/utils/safeEnv";

const stripeKey = safeEnv("STRIPE_SECRET_KEY");
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function createStripeCheckoutSession(
  lineItems: Array<{ title: string; price: number; quantity: number }>
): Promise<{ url?: string; error?: string }> {
  if (!stripe) {
    return { error: "STRIPE_NOT_CONFIGURED" };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      success_url: `${safeEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"}/checkout/success`,
      cancel_url: `${safeEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000"}/checkout`,
    });

    if (session.url) {
      return { url: session.url };
    }
  } catch {
    return { error: "STRIPE_SESSION_FAILED" };
  }

  return { error: "STRIPE_SESSION_FAILED" };
}
