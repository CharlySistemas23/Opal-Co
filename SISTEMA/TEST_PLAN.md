# Test plan

## Unit tests

- **Utils**: `formatPrice` (USD formatting, zero/small amounts), `safeEnv` (missing key returns empty string).
- Run: `npm test` (Vitest).

## Smoke tests (Playwright)

To add when Playwright is configured:

1. Home loads (mock mode, no env vars).
2. Collections loads.
3. Product PDP loads (e.g. `/products/radiance-ring`).
4. Bag opens (CartDrawer); shows “unavailable” message when Shopify not configured.
5. Checkout page loads; shows form or “empty cart” / “not configured” message.

Run in mock mode: unset all env vars and run tests against `http://localhost:3000`.

## Manual checks

- All Header/Footer links resolve (no 404).
- Contact form submits to `/api/contact`, shows success.
- Appointment form submits to `/api/appointment`, shows success.
- Cart: without Shopify, “Contact us” CTA; with Shopify, add/remove/quantity and subtotal.
- Checkout: without Stripe, “Contact us” and “Book an appointment” CTAs; with Stripe, redirect to session.
- Placeholder products show “By inquiry” and Inquire → `/appointments`.
