# Sistema 1.0

Versión inicial del sistema OPAL & CO para despliegue en GitHub / Vercel.

## Contenido

- Aplicación Next.js 14 (App Router)
- Admin panel
- Prisma + PostgreSQL
- Tests (Vitest, Playwright)

## Instalación

```bash
npm install
cp .env.example .env.local
# Editar .env.local con tus variables (DATABASE_URL, etc.)
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```
