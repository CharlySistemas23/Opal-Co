# OPAL & CO — Architecture

## App Router structure

```
app/
├── layout.tsx          # Root layout, providers (Cart, Search, Sound), Header, Footer
├── page.tsx            # Home
├── not-found.tsx       # 404 page
├── error.tsx           # Error boundary
├── loading.tsx         # Global loading skeleton
├── api/
│   ├── contact/        # POST: contact form (stub)
│   ├── appointment/    # POST: appointment request (stub)
│   └── search/         # GET ?q= : product search (mock or Shopify)
├── appointments/       # Booking page
├── checkout/           # Checkout + success
├── collections/        # Collections list + [slug] filtered grid
├── contact/            # Contact form
├── faq/                # FAQ list + [slug] detail
├── high-jewelry/       # High Jewelry grid
├── journal/            # Journal list + [slug] article
├── legal/              # privacy, terms, returns, cookies
├── private-clients/    # Private Clients program
├── products/[handle]/  # PDP
├── stores/             # Stores list + [slug] detail
└── the-house/          # Brand story
```

## Mock mode behavior

- **safeEnv** (`utils/safeEnv.ts`): Returns `""` when env var is missing.
- **Fallbacks**: All data fetchers return `[]` or `null` when config is absent; UI uses placeholder data from `PLACEHOLDER_MAP`, `mock-stores.json`, `mock-faq.json`, `lib/search/mockProducts.ts`.
- **Never crash**: Cart, Checkout, Search, and PDP handle missing Shopify/Stripe gracefully with CTAs to Contact or Appointments.

## Shopify integration

- **lib/shopify/client.ts**: Storefront API fetch wrapper.
- **lib/shopify/queries.ts**: GROQ-style queries (products, collections, cart).
- **lib/shopify/index.ts**: `getProducts`, `getProductByHandle`, `getCollections`, `getCollectionByHandle`, cart mutations. All return `[]`/`null` on error or missing config.

## Sanity integration

- **lib/sanity/client.ts**: Sanity client.
- **lib/sanity/queries.ts**: Manifesto, journal entries.
- **lib/sanity/index.ts**: `getManifestoBlock`, `getJournalEntries`, `getJournalEntryBySlug`. Return `null`/`[]` when not configured.

## Stripe checkout

- **app/actions/checkout.ts**: `createStripeCheckoutSession`. Returns `{ error: "STRIPE_NOT_CONFIGURED" }` when `STRIPE_SECRET_KEY` is missing.
- **CheckoutForm**: Shows CTAs to Contact and Appointments when Stripe is not configured.

## Context providers

| Provider      | Purpose                                      |
|---------------|----------------------------------------------|
| CartProvider  | Cart state, add/remove/update, localStorage  |
| SearchProvider| Search overlay state, open/close, results    |
| SoundProvider | Sound toggle preference                      |

## Key components

| Component     | Role                                           |
|---------------|------------------------------------------------|
| Header        | Nav, Search trigger, Bag, mobile menu          |
| Footer        | Nav links, legal links                         |
| CartDrawer    | Slide-out cart, subtotal, checkout link        |
| SearchOverlay | Full-screen search with focus trap, ESC, results |
| ProductGallery| PDP images, crossfade, hover zoom              |
| ProductInfo   | PDP details, CTA, accordions, mobile sticky CTA|

## Testing strategy

- **Vitest** (`npm test`): Unit tests for `formatPrice`, `safeEnv`, etc.
- **Playwright** (`npm run test:e2e`): Smoke tests for Home, Collections, Product, Cart, Checkout in mock mode.
