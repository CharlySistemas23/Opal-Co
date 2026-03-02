import Stripe from "stripe";
import { db } from "@/lib/db";
import { databaseConfigured, safeEnv } from "@/utils/safeEnv";
import { getDefaultBranchId } from "@/lib/data/inventory";

const stripeSecret = safeEnv("STRIPE_SECRET_KEY");
const webhookSecret = safeEnv("STRIPE_WEBHOOK_SECRET");
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

export async function POST(request: Request) {
  if (!webhookSecret || !stripe) {
    return new Response("Webhook not configured", { status: 503 });
  }
  if (!databaseConfigured() || !db) {
    return new Response("Database not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId as string | undefined;
    if (!orderId) {
      return new Response("Missing orderId in metadata", { status: 400 });
    }

    const payment = await db.payment.findFirst({
      where: {
        orderId,
        stripeCheckoutSessionId: session.id,
      },
      include: { order: { include: { items: true } } },
    });
    if (!payment) {
      return new Response("Payment not found", { status: 404 });
    }
    if (payment.status === "SUCCEEDED") {
      return new Response("OK", { status: 200 });
    }

    const branchId = await getDefaultBranchId();
    if (branchId) {
      for (const item of payment.order.items) {
        const level = await db.stockLevel.findUnique({
          where: {
            branchId_variantId: { branchId, variantId: item.variantId },
          },
        });
        const newQty = Math.max(0, (level?.quantity ?? 0) - item.quantity);
        await db.stockLevel.upsert({
          where: {
            branchId_variantId: { branchId, variantId: item.variantId },
          },
          create: { branchId, variantId: item.variantId, quantity: newQty },
          update: { quantity: newQty },
        });
        await db.stockMovement.create({
          data: {
            branchId,
            variantId: item.variantId,
            type: "OUT",
            quantity: item.quantity,
            referenceType: "ORDER",
            referenceId: orderId,
          },
        });
      }
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { status: "SUCCEEDED" },
    });
    await db.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });
    if (payment.order.cartId) {
      await db.cart.update({
        where: { id: payment.order.cartId },
        data: { status: "ORDERED" },
      });
    }

    return new Response("OK", { status: 200 });
  }

  if (
    event.type === "checkout.session.expired" ||
    event.type === "payment_intent.payment_failed"
  ) {
    let payment: { id: string } | null = null;
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      payment = await db.payment.findFirst({
        where: { stripeCheckoutSessionId: session.id },
        select: { id: true },
      });
    }
    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      payment = await db.payment.findFirst({
        where: { stripePaymentIntentId: pi.id },
        select: { id: true },
      });
    }
    if (payment) {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }
    return new Response("OK", { status: 200 });
  }

  return new Response("OK", { status: 200 });
}
