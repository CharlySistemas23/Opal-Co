import { randomBytes } from "crypto";
import Stripe from "stripe";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { getCartForCheckout } from "@/lib/data/cart";
import { getCustomerSessionFromCookie } from "@/lib/customer-auth";
import { getAvailableStockForVariant } from "@/lib/data/inventory";
import { db } from "@/lib/db";
import { databaseConfigured, isStripeConfigured, safeEnv } from "@/utils/safeEnv";

function generateOrderNumber(): string {
  return `OP-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function POST(request: Request) {
  if (!databaseConfigured() || !db) {
    return apiError("UNAVAILABLE", 503);
  }
  if (!isStripeConfigured()) {
    return apiError("STRIPE_NOT_CONFIGURED", 503);
  }

  let body: { cartId?: string; email?: string } = {};
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", 400);
  }
  const cartId = typeof body.cartId === "string" ? body.cartId.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!cartId) return apiError("INVALID_CART_ID", 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError("INVALID_EMAIL", 400);
  }

  const cart = await getCartForCheckout(cartId);
  if (!cart || cart.items.length === 0) {
    return apiError("INVALID_CART", 400);
  }

  for (const item of cart.items) {
    const available = await getAvailableStockForVariant(item.variantId);
    if (item.quantity > available) {
      return apiError("INSUFFICIENT_STOCK", 400);
    }
  }

  const subtotalCents = cart.items.reduce(
    (sum, i) => sum + i.snapshotPriceCents * i.quantity,
    0
  );
  const shippingCents = 0;
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;

  let orderNumber = generateOrderNumber();
  let exists = await db.order.findUnique({ where: { orderNumber } });
  while (exists) {
    orderNumber = generateOrderNumber();
    exists = await db.order.findUnique({ where: { orderNumber } });
  }

  const cookieHeader = request.headers.get("cookie");
  const customerSession = getCustomerSessionFromCookie(cookieHeader);
  const customerId = customerSession?.customerId ?? cart.customerId ?? null;

  const stripe = new Stripe(safeEnv("STRIPE_SECRET_KEY"));
  const siteUrl = safeEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";

  const [order] = await db.$transaction([
    db.order.create({
      data: {
        orderNumber,
        cartId: cart.id,
        customerId,
        email,
        status: "PENDING_PAYMENT",
        currency: "USD",
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
      },
    }),
  ]);

  await db.orderItem.createMany({
    data: cart.items.map((i) => ({
      orderId: order.id,
      variantId: i.variantId,
      sku: i.variant.sku,
      title: i.snapshotTitle,
      priceCents: i.snapshotPriceCents,
      quantity: i.quantity,
    })),
  });

  const payment = await db.payment.create({
    data: {
      orderId: order.id,
      provider: "STRIPE",
      status: "REQUIRES_PAYMENT",
    },
  });

  const lineItems = cart.items.map((i) => ({
    price_data: {
      currency: "usd",
      product_data: { name: i.snapshotTitle },
      unit_amount: i.snapshotPriceCents,
    },
    quantity: i.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout`,
    customer_email: email,
    metadata: { orderId: order.id, orderNumber },
  });

  await db.payment.update({
    where: { id: payment.id },
    data: { stripeCheckoutSessionId: session.id },
  });

  if (session.url) {
    return apiSuccess({ url: session.url });
  }
  return apiError("STRIPE_SESSION_FAILED", 500);
}
