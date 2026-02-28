# ===== Build stage =====
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .
RUN npm run build

# ===== Production stage =====
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/lib/generated ./lib/generated
COPY --from=builder /app/scripts ./scripts

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Migraciones + verificación + inicio de Next.js
CMD ["sh", "-c", "npx prisma migrate deploy && node scripts/verify-db.mjs && npm run start"]
