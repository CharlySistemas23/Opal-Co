# OPAL & CO

A contemporary high jewelry e-commerce site built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Shopify Storefront API, Sanity CMS, and Stripe.

## Mock mode (no env vars)

The site runs **without any environment variables**. In this mode:

- **Home, Collections, Journal, The House, Contact, Private Clients** render with placeholder content.
- **Cart/Bag**: Shows “Shopping bag is unavailable” with a link to Contact (when neither DB nor Shopify is configured).
- **Checkout**: Form is available; payment shows “Payment is not configured” with CTAs to Contact and Appointments.
- **Products**: Placeholder products (e.g. Radiance Ring, Luminance Necklace) show “By inquiry” and link to Appointments.
- **Newsletter**: Without Postmark/Resend, subscription shows “email service not configured”.

All internal links resolve; no 404s for in-app navigation.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run dev:3003` to run on port 3003.

## Configuration

Copy `.env.example` to `.env.local` and fill in only what you need.

### Shopify (cart + products)

- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` – store subdomain (e.g. `your-store`)
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` – Storefront API token

When set, products and collections come from Shopify; cart (add/remove/update, persist in localStorage) works.

### Sanity (journal + optional manifesto)

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` (default: `production`)

When set, Journal entries and the manifesto block use Sanity. Otherwise, mock journal entries are used.

### Stripe (checkout)

- `STRIPE_SECRET_KEY` – server-side secret for creating Checkout sessions

When set, “Proceed to Payment” redirects to Stripe Checkout. When not set, the checkout page shows a message and links to Contact and Appointments.

### Database (Prisma)

- `DATABASE_URL` – PostgreSQL connection string

```bash
npm run db:migrate   # Aplicar migraciones (producción)
npm run db:seed      # Datos iniciales (requiere ADMIN_OWNER_EMAIL)
npm run db:verify    # Verificar que tablas existan
```

En deploy (Railway/Docker): las migraciones y el seed se ejecutan automáticamente al iniciar.

Without `DATABASE_URL`, the public site works with mock/placeholder data; the admin shows “Database not configured” and login uses mock mode (`owner@local.dev`).

### Admin (primer usuario)

- `ADMIN_OWNER_EMAIL` – Si está definido, el seed crea un usuario OWNER con este email en cada deploy.
- `ADMIN_SESSION_SECRET` – (recomendado en producción) secreto para firmar cookies de sesión.
- `ADMIN_OTP_PEPPER` – (recomendado en producción) pepper para hashear códigos OTP.
- `ADMIN_EMAIL_FROM` / `ADMIN_EMAIL_FROM_NAME` – Remitente para correos OTP del admin.

Para crear un admin manualmente: `ADMIN_EMAIL=tu@email.com npm run db:create-admin`

### Cloudinary (media uploads)

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

When set, admin media uploads use signed Cloudinary uploads. When missing, uploads are disabled and show “Cloudinary not configured”.

### Stripe (checkout + webhook)

- `STRIPE_SECRET_KEY` – server-side secret for creating Checkout sessions
- `STRIPE_WEBHOOK_SECRET` – (optional) for webhook signature verification

Configure the webhook endpoint `POST /api/webhooks/stripe` in Stripe Dashboard for events such as `checkout.session.completed`. Without `STRIPE_SECRET_KEY`, checkout shows “Payment is not configured”.

### Postmark / Resend (emails)

- Postmark: `POSTMARK_SERVER_TOKEN`
- Resend: `RESEND_API_KEY`

Templates: `subscribe_confirm`, contact, appointment (Postmark template aliases or Resend template IDs).

When neither is configured: newsletter subscription returns “email service not configured”; admin OTP is printed to the console in mock mode.

### Revalidation (optional)

- `REVALIDATE_SECRET` – token for `POST /api/revalidate` (external webhooks, on-demand revalidation)

### Site

- `NEXT_PUBLIC_SITE_URL` – canonical base URL (default: `https://opal-and-co.com`)

Used for metadata, sitemap, and Stripe success/cancel URLs.

## Deploy en Railway

1. **Variables requeridas** (servicio Opal-Co):
   - `DATABASE_URL` – Referenciar desde el servicio Postgres.
   - `ADMIN_OWNER_EMAIL` – Email del primer admin (se crea automáticamente con el seed).
   - `ADMIN_SESSION_SECRET` – Valor aleatorio (ej. `openssl rand -hex 32`).

2. **Variables recomendadas**:
   - `RESEND_API_KEY` o `POSTMARK_SERVER_TOKEN` – Para recibir OTP por email. Sin esto, el código OTP se imprime en los logs de deploy.
   - `CLOUDINARY_*` – Para subir imágenes desde el admin.
   - `STRIPE_SECRET_KEY` – Para checkout.

3. **Dominio**: En Settings → Domains, genera un dominio para acceder al sitio.

4. **Admin manual** (si no usas seed): En Railway, ejecuta un comando único:
   ```bash
   ADMIN_EMAIL=tu@email.com npm run db:create-admin
   ```
   (usa la `DATABASE_URL` del entorno)

## Deploy en Vercel

1. **Conectar repo**: Importa el proyecto desde GitHub en [vercel.com](https://vercel.com).

2. **Variables de entorno** (Settings → Environment Variables):
   - `DATABASE_URL` – URL de PostgreSQL (Neon, Supabase, Railway Postgres, etc.). Vercel puede usar la misma DB que Railway.
   - `ADMIN_OWNER_EMAIL` – Email del admin (para seed).
   - `ADMIN_SESSION_SECRET` – Secreto para sesiones admin.
   - `CUSTOMER_SESSION_SECRET` – Secreto para sesiones de clientes.
   - `NEXT_PUBLIC_SITE_URL` – URL de tu sitio en Vercel (ej. `https://tu-proyecto.vercel.app`).
   - Opcionales: `RESEND_API_KEY`, `CLOUDINARY_*`, `STRIPE_SECRET_KEY`.

3. **Build**: El proyecto usa `vercel-build` que ejecuta migraciones + build. No hace falta configurar nada extra.

4. **Base de datos**: Si usas la misma Postgres de Railway, pega la `DATABASE_URL` en Vercel. Las migraciones se aplicarán en cada deploy.

## Feature overview

- **Routes**: Home, Collections, High Jewelry, The House, Journal, Contact, Private Clients, Appointments, Stores, FAQ, Legal (Privacy, Terms, Returns, Cookies), Checkout, Products (PDP).
- **Commerce**: Cart drawer (add/remove/quantity, subtotal), checkout with Stripe or fallback CTAs, placeholder “By inquiry” for high jewelry.
- **APIs**: `POST /api/contact` and `POST /api/appointment` accept JSON and return 200 (stub: log payload).
- **Global**: `app/not-found.tsx`, `app/error.tsx`, `app/loading.tsx`; sitemap and robots included.

## Build

```bash
npm run build
```

Runs in mock mode if no env vars are set. Lint and type-check run as part of build.

## Tests

```bash
npm test           # Vitest unit tests
npm run test:e2e   # Playwright smoke tests (mock mode)
```

Unit tests cover utils (`formatPrice`, `safeEnv`, `calculateCartSubtotal`), cart calculation, and admin auth (OTP hashing/verification). Playwright runs smoke tests including admin login, cart drawer, checkout, and home. See `TEST_PLAN.md`, `ARCHITECTURE.md`, and `CONTENT_GUIDE.md` for details.
