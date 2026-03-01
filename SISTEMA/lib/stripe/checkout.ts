/**
 * NOTE: Checkout flow is implemented in app/actions/checkout.ts.
 * This file is reserved for future refactor.
 */

export async function createCheckoutSession(
  lineItems: Array<{ priceId: string; quantity: number }>
): Promise<{ url: string }> {
  void lineItems; // Placeholder - will use in Phase 9
  // TODO: Stripe session creation
  return { url: "/checkout" };
}
