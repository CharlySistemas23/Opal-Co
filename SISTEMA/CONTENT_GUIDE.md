# OPAL & CO — Content Guide

## Tone of voice

- **Restrained**: No hype, no superlatives. State facts and benefits.
- **Confident**: Short sentences. Declarative.
- **Warm but formal**: “We take time.” Not “We’re super passionate!”

## Copy examples

### Manifesto

- **Headline**: “The Manifesto”
- **Body**: “Jewelry that speaks in silence. Crafted for those who understand that true luxury needs no announcement.”

### Product microcopy

- **Details**: “Handcrafted with precision. Each piece is unique.”
- **Care**: “Store in a soft pouch. Avoid contact with chemicals.”
- **By inquiry**: Use “By inquiry” for High Jewelry; primary CTA: “Inquire” → Appointments.

### Inquiry / Private Clients

- **Private Clients intro**: “For those who seek the exceptional. Our Private Client program offers exclusive access, bespoke creation, and a relationship built on discretion and craftsmanship.”
- **Appointments**: “Book a private viewing or consultation. We respond within twenty-four hours.”
- **Contact**: “For inquiries, appointments, and assistance. We respond within twenty-four hours.”

## Shopify

### Products

- **Handles**: Lowercase, hyphenated (e.g. `radiance-ring`, `luminance-necklace`).
- **Mock fallback**: PDP uses `PLACEHOLDER_MAP` for `radiance-ring`, `luminance-necklace`, `serenity-earrings`, `essence-bracelet` when Shopify returns nothing.

### Collections

- **Handles**: `signature`, `for-herself`, `for-her`, `high-jewelry` for mock fallback.
- **Description**: Shown on collection page when present.

## Sanity

### Manifesto block

- Schema: `manifestoBlock` with `headline`, `body`.
- Fallback: “The Manifesto” and default body if empty.

### Journal

- Schema: `journalEntry` with `title`, `slug`, `excerpt`, `body`, `publishedAt`, `mainImage`.
- **Slugs**: Lowercase, hyphenated (e.g. `the-art-of-patience`).
- Fallback: Mock entries from `placeholderEntries`.

## Image guidelines

- **Style**: Architectural minimal; warm material close-ups.
- **Aspect ratios**: 4:5 for product/collection cards; 4:3 for editorial.
- **Formats**: Next/Image with `sizes`; Unsplash or local SVGs for placeholders.

## High Jewelry rules

- **By inquiry**: Products with `variantId === "placeholder"` show “By inquiry” and route to Appointments.
- **Flow**: PDP “Inquire” → `/appointments`; Private Clients “Inquire” → `/contact`.
- **Placeholder handles**: `radiance-ring`, `luminance-necklace` (and others in `PLACEHOLDER_MAP`) are supported in mock mode.
