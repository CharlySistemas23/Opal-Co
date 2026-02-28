import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseConfigured, safeEnv } from "@/utils/safeEnv";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrismaClient() {
  const connectionString = safeEnv("DATABASE_URL");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const db: PrismaClient | null = databaseConfigured()
  ? (globalForPrisma.prisma ??= createPrismaClient())
  : null;
